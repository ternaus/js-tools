const PATH_PARAM_RE = /\{[^{}]+\}/g;

/**
 * Returns a cheap, non-cryptographically-secure random ID
 * Courtesy of @imranbarbhuiya (https://github.com/imranbarbhuiya)
 */
export function randomID() {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Create an openapi-fetch client.
 * @type {import("./index.js").default}
 */
export default function createClient(clientOptions) {
  let {
    baseUrl = "",
    Request: CustomRequest = globalThis.Request,
    fetch: baseFetch = globalThis.fetch,
    querySerializer: globalQuerySerializer,
    bodySerializer: globalBodySerializer,
    pathSerializer: globalPathSerializer,
    headers: baseHeaders,
    requestInitExt = undefined,
    ...baseOptions
  } = { ...clientOptions };
  requestInitExt = typeof process === "object" && process.versions?.undici ? requestInitExt : undefined;
  baseUrl = removeTrailingSlash(baseUrl);
  const globalMiddlewares = [];

  async function coreFetch(schemaPath, fetchOptions) {
    const {
      baseUrl: localBaseUrl,
      fetch = baseFetch,
      Request = CustomRequest,
      headers,
      params = {},
      parseAs = "json",
      querySerializer: requestQuerySerializer,
      bodySerializer = globalBodySerializer ?? defaultBodySerializer,
      pathSerializer: requestPathSerializer,
      body,
      middleware: requestMiddlewares = [],
      ...init
    } = fetchOptions || {};
    let finalBaseUrl = baseUrl;
    if (localBaseUrl) {
      finalBaseUrl = removeTrailingSlash(localBaseUrl);
    }

    let querySerializer =
      typeof globalQuerySerializer === "function"
        ? globalQuerySerializer
        : createQuerySerializer(globalQuerySerializer);
    if (requestQuerySerializer) {
      querySerializer =
        typeof requestQuerySerializer === "function"
          ? requestQuerySerializer
          : createQuerySerializer({
              ...(typeof globalQuerySerializer === "object" ? globalQuerySerializer : {}),
              ...requestQuerySerializer,
            });
    }

    const pathSerializer = requestPathSerializer || globalPathSerializer || defaultPathSerializer;

    const serializedBody =
      body === undefined
        ? undefined
        : bodySerializer(
            body,
            // The serializer needs user headers; the later merge adds the default
            // Content-Type at lowest priority and preserves explicit null deletions.
            mergeHeaders(baseHeaders, headers, params.header),
          );
    const finalHeaders = mergeHeaders(
      serializedBody === undefined || serializedBody instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          },
      baseHeaders,
      headers,
      params.header,
    );

    // Client level middleware take priority over request-level middleware
    const finalMiddlewares = [...globalMiddlewares, ...requestMiddlewares];

    const requestInit = {
      redirect: "follow",
      ...baseOptions,
      ...init,
      body: serializedBody,
      headers: finalHeaders,
    };

    let id;
    let options;
    let request = new Request(
      createFinalURL(schemaPath, { baseUrl: finalBaseUrl, params, querySerializer, pathSerializer }),
      requestInit,
    );
    let response;
    for (const key in init) {
      if (!(key in request)) {
        request[key] = init[key];
      }
    }

    if (finalMiddlewares.length) {
      id = randomID();

      options = Object.freeze({
        baseUrl: finalBaseUrl,
        fetch,
        parseAs,
        querySerializer,
        bodySerializer,
        pathSerializer,
      });
      for (const m of finalMiddlewares) {
        if (m && typeof m === "object" && typeof m.onRequest === "function") {
          const result = await m.onRequest({
            request,
            schemaPath,
            params,
            options,
            id,
          });
          if (result && result !== request) {
            if (result instanceof Request) {
              request = result;
            } else if (result instanceof Response) {
              response = result;
              break;
            } else {
              throw new Error("onRequest: must return new Request() or Response() when modifying the request");
            }
          }
        }
      }
    }

    if (!response) {
      try {
        response = await fetch(request, requestInitExt);
      } catch (error) {
        let errorAfterMiddleware = error;
        // execute in reverse-array order (first priority gets last transform)
        for (let i = finalMiddlewares.length - 1; i >= 0; i--) {
          const m = finalMiddlewares[i];
          if (m && typeof m === "object" && typeof m.onError === "function") {
            const result = await m.onError({
              request,
              error: errorAfterMiddleware,
              schemaPath,
              params,
              options,
              id,
            });
            if (result) {
              // if error is handled by returning a response, skip remaining middleware
              if (result instanceof Response) {
                errorAfterMiddleware = undefined;
                response = result;
                break;
              }

              if (result instanceof Error) {
                errorAfterMiddleware = result;
                continue;
              }

              throw new Error("onError: must return new Response() or instance of Error");
            }
          }
        }

        // rethrow error if not handled by middleware
        if (errorAfterMiddleware) {
          throw errorAfterMiddleware;
        }
      }

      // execute in reverse-array order (first priority gets last transform)
      if (finalMiddlewares.length) {
        for (let i = finalMiddlewares.length - 1; i >= 0; i--) {
          const m = finalMiddlewares[i];
          if (m && typeof m === "object" && typeof m.onResponse === "function") {
            const result = await m.onResponse({
              request,
              response,
              schemaPath,
              params,
              options,
              id,
            });
            if (result) {
              if (!(result instanceof Response)) {
                throw new Error("onResponse: must return new Response() when modifying the response");
              }
              response = result;
            }
          }
        }
      }
    }

    const contentLength = response.headers.get("Content-Length");
    if (
      response.status === 204 ||
      request.method === "HEAD" ||
      (contentLength === "0" && !response.headers.get("Transfer-Encoding")?.includes("chunked"))
    ) {
      return response.ok ? { data: undefined, response } : { error: undefined, response };
    }

    // parse response (falling back to .text() when necessary)
    if (response.ok) {
      if (parseAs === "stream") {
        return { data: response.body, response };
      }
      if (parseAs === "json" && !contentLength) {
        // Empty success bodies without Content-Length must not reach JSON.parse.
        const raw = await response.text();
        return { data: raw ? JSON.parse(raw) : undefined, response };
      }
      return { data: await response[parseAs](), response };
    }

    // handle errors (use text() when no content-length to safely handle empty bodies from proxies)
    const raw = await response.text();
    if (!raw) {
      // empty error body - return undefined to be consistent with status 204 handling
      return { error: undefined, response };
    }
    let error = raw;
    try {
      error = JSON.parse(raw);
    } catch {
      // noop - keep as raw text
    }
    return { error, response };
  }

  return {
    get baseUrl() {
      return baseUrl;
    },
    request(method, url, init) {
      return coreFetch(url, { ...init, method: method.toUpperCase() });
    },
    GET(url, init) {
      return coreFetch(url, { ...init, method: "GET" });
    },
    PUT(url, init) {
      return coreFetch(url, { ...init, method: "PUT" });
    },
    POST(url, init) {
      return coreFetch(url, { ...init, method: "POST" });
    },
    DELETE(url, init) {
      return coreFetch(url, { ...init, method: "DELETE" });
    },
    OPTIONS(url, init) {
      return coreFetch(url, { ...init, method: "OPTIONS" });
    },
    HEAD(url, init) {
      return coreFetch(url, { ...init, method: "HEAD" });
    },
    PATCH(url, init) {
      return coreFetch(url, { ...init, method: "PATCH" });
    },
    TRACE(url, init) {
      return coreFetch(url, { ...init, method: "TRACE" });
    },
    use(...middleware) {
      for (const m of middleware) {
        if (!m) {
          continue;
        }
        if (typeof m !== "object" || !("onRequest" in m || "onResponse" in m || "onError" in m)) {
          throw new Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");
        }
        globalMiddlewares.push(m);
      }
    },
    eject(...middleware) {
      for (const m of middleware) {
        const i = globalMiddlewares.indexOf(m);
        if (i !== -1) {
          globalMiddlewares.splice(i, 1);
        }
      }
    },
  };
}

class PathCallForwarder {
  constructor(client, url) {
    this.client = client;
    this.url = url;
  }

  GET = (init) => {
    return this.client.GET(this.url, init);
  };
  PUT = (init) => {
    return this.client.PUT(this.url, init);
  };
  POST = (init) => {
    return this.client.POST(this.url, init);
  };
  DELETE = (init) => {
    return this.client.DELETE(this.url, init);
  };
  OPTIONS = (init) => {
    return this.client.OPTIONS(this.url, init);
  };
  HEAD = (init) => {
    return this.client.HEAD(this.url, init);
  };
  PATCH = (init) => {
    return this.client.PATCH(this.url, init);
  };
  TRACE = (init) => {
    return this.client.TRACE(this.url, init);
  };
}

/**
 * Wrap openapi-fetch client to support a path based API.
 * @type {import("./index.js").wrapAsPathBasedClient}
 */
export function wrapAsPathBasedClient(coreClient) {
  // Cache endpoint forwarders on the client so repeated calls bypass the proxy.
  const client = Object.create(
    new Proxy(coreClient, {
      get(target, url) {
        const forwarder = new PathCallForwarder(target, url);
        client[url] = forwarder;
        return forwarder;
      },
    }),
  );

  return client;
}

/**
 * Convenience method to an openapi-fetch path based client.
 * Strictly equivalent to `wrapAsPathBasedClient(createClient(...))`.
 * @type {import("./index.js").createPathBasedClient}
 */
export function createPathBasedClient(clientOptions) {
  return wrapAsPathBasedClient(createClient(clientOptions));
}

/**
 * Serialize primitive param values
 * @type {import("./index.js").serializePrimitiveParam}
 */
export function serializePrimitiveParam(name, value, options) {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "object") {
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.",
    );
  }
  return `${name}=${options?.allowReserved === true ? value : encodeURIComponent(value)}`;
}

/**
 * Serialize object param (shallow only)
 * @type {import("./index.js").serializeObjectParam}
 */
export function serializeObjectParam(name, value, options) {
  if (!value || typeof value !== "object") {
    return "";
  }
  const values = [];
  const joiner =
    {
      simple: ",",
      label: ".",
      matrix: ";",
    }[options.style] || "&";

  // explode: false
  if (options.style !== "deepObject" && options.explode === false) {
    for (const k in value) {
      values.push(k, options.allowReserved === true ? value[k] : encodeURIComponent(value[k]));
    }
    const final = values.join(","); // note: values are always joined by comma in explode: false (but joiner can prefix)
    switch (options.style) {
      case "form": {
        return `${name}=${final}`;
      }
      case "label": {
        return `.${final}`;
      }
      case "matrix": {
        return `;${name}=${final}`;
      }
      default: {
        return final;
      }
    }
  }

  // explode: true
  for (const k in value) {
    const finalName = options.style === "deepObject" ? `${name}[${k}]` : k;
    values.push(serializePrimitiveParam(finalName, value[k], options));
  }
  const final = values.join(joiner);
  return options.style === "label" || options.style === "matrix" ? `${joiner}${final}` : final;
}

/**
 * Serialize array param (shallow only)
 * @type {import("./index.js").serializeArrayParam}
 */
export function serializeArrayParam(name, value, options) {
  if (!Array.isArray(value)) {
    return "";
  }

  // explode: false
  if (options.explode === false) {
    const joiner = { form: ",", spaceDelimited: "%20", pipeDelimited: "|" }[options.style] || ","; // note: for arrays, joiners vary wildly based on style + explode behavior
    const final = (options.allowReserved === true ? value : value.map((v) => encodeURIComponent(v))).join(joiner);
    switch (options.style) {
      case "simple": {
        return final;
      }
      case "label": {
        return `.${final}`;
      }
      case "matrix": {
        return `;${name}=${final}`;
      }
      default: {
        return `${name}=${final}`;
      }
    }
  }

  // explode: true
  const joiner = { simple: ",", label: ".", matrix: ";" }[options.style] || "&";
  const values = [];
  for (const v of value) {
    if (options.style === "simple" || options.style === "label") {
      values.push(options.allowReserved === true ? v : encodeURIComponent(v));
    } else {
      values.push(serializePrimitiveParam(name, v, options));
    }
  }
  return options.style === "label" || options.style === "matrix"
    ? `${joiner}${values.join(joiner)}`
    : values.join(joiner);
}

/**
 * Serialize query params to string
 * @type {import("./index.js").createQuerySerializer}
 */
export function createQuerySerializer(options) {
  return function querySerializer(queryParams) {
    const search = [];
    if (queryParams && typeof queryParams === "object") {
      for (const name in queryParams) {
        const value = queryParams[name];
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            continue;
          }
          search.push(
            serializeArrayParam(name, value, {
              style: "form",
              explode: true,
              ...options?.array,
              allowReserved: options?.allowReserved || false,
            }),
          );
          continue;
        }
        if (typeof value === "object") {
          search.push(
            serializeObjectParam(name, value, {
              style: "deepObject",
              explode: true,
              ...options?.object,
              allowReserved: options?.allowReserved || false,
            }),
          );
          continue;
        }
        search.push(serializePrimitiveParam(name, value, options));
      }
    }
    return search.join("&");
  };
}

/**
 * Handle different OpenAPI 3.x serialization styles
 * @type {import("./index.js").defaultPathSerializer}
 * @see https://swagger.io/docs/specification/serialization/#path
 */
export function defaultPathSerializer(pathname, pathParams) {
  let nextURL = pathname;
  for (const match of pathname.match(PATH_PARAM_RE) ?? []) {
    let name = match.substring(1, match.length - 1);
    let explode = false;
    let style = "simple";
    if (name.endsWith("*")) {
      explode = true;
      name = name.substring(0, name.length - 1);
    }
    if (name.startsWith(".")) {
      style = "label";
      name = name.substring(1);
    } else if (name.startsWith(";")) {
      style = "matrix";
      name = name.substring(1);
    }
    if (!pathParams || pathParams[name] === undefined || pathParams[name] === null) {
      continue;
    }
    const value = pathParams[name];
    if (Array.isArray(value)) {
      nextURL = nextURL.replace(match, serializeArrayParam(name, value, { style, explode }));
      continue;
    }
    if (typeof value === "object") {
      nextURL = nextURL.replace(match, serializeObjectParam(name, value, { style, explode }));
      continue;
    }
    if (style === "matrix") {
      nextURL = nextURL.replace(match, `;${serializePrimitiveParam(name, value)}`);
      continue;
    }
    nextURL = nextURL.replace(match, style === "label" ? `.${encodeURIComponent(value)}` : encodeURIComponent(value));
  }
  if (/(?:^|\/)(?:\.|%2e){1,2}(?:\/|$)/i.test(nextURL)) {
    throw new Error("Invalid path dot segment.");
  }
  return nextURL;
}

/**
 * Serialize body object to string
 * @type {import("./index.js").defaultBodySerializer}
 */
export function defaultBodySerializer(body, headers) {
  if (body instanceof FormData) {
    return body;
  }
  if (headers) {
    const contentType =
      typeof headers.get === "function"
        ? headers.get("Content-Type")
        : (headers["Content-Type"] ?? headers["content-type"]);
    const mediaType = contentType?.split(";")[0].trim().toLowerCase();
    if (mediaType === "application/x-www-form-urlencoded") {
      return new URLSearchParams(body).toString();
    }
    if (typeof body === "string" && mediaType?.startsWith("text/")) {
      return body;
    }
  }
  return JSON.stringify(body);
}

/**
 * Construct URL string from baseUrl and handle path and query params
 * @type {import("./index.js").createFinalURL}
 */
export function createFinalURL(pathname, options) {
  let finalURL = `${options.baseUrl}${pathname}`;
  if (options.params?.path) {
    finalURL = options.pathSerializer(finalURL, options.params.path);
  }
  let search = options.querySerializer(options.params.query ?? {});
  if (search.startsWith("?")) {
    search = search.slice(1);
  }
  if (search) {
    finalURL += `?${search}`;
  }
  return finalURL;
}

/**
 * Merge headers a and b, with b taking priority
 * @type {import("./index.js").mergeHeaders}
 */
export function mergeHeaders(...allHeaders) {
  const finalHeaders = new Headers();
  for (const h of allHeaders) {
    if (!h || typeof h !== "object") {
      continue;
    }
    const iterator = h instanceof Headers ? h.entries() : Object.entries(h);
    for (const [k, v] of iterator) {
      if (v === null) {
        finalHeaders.delete(k);
      } else if (Array.isArray(v)) {
        for (const v2 of v) {
          finalHeaders.append(k, v2);
        }
      } else if (v !== undefined) {
        finalHeaders.set(k, v);
      }
    }
  }
  return finalHeaders;
}

/**
 * Remove trailing slash from url
 * @type {import("./index.js").removeTrailingSlash}
 */
export function removeTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
