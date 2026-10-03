import {
  http,
  HttpResponse,
  type JsonBodyType,
  type StrictRequest,
  type DefaultBodyType,
  type HttpResponseResolver,
  type PathParams,
  type AsyncResponseResolverReturnType,
} from "msw";
import { setupServer } from "msw/node";

export const server = setupServer();
export const baseUrl = "https://api.example.com" as const;

export function toAbsoluteURL(path: string, base: string = baseUrl) {
  // Preserve a pathname such as /v1 from the API base URL.
  const baseUrlInstance = new URL(base);

  const newPath = `${baseUrlInstance.pathname}/${path}`.replace(/\/+/g, "/");

  return new URL(newPath, baseUrlInstance).toString();
}

export type MswHttpMethod = keyof typeof http;

export interface MockRequestHandlerOptions<
  Params extends PathParams<keyof Params> = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  ResponseBodyType extends DefaultBodyType = undefined,
> {
  baseUrl?: string;
  method: MswHttpMethod;
  /**
   * Relative or absolute path to match.
   * When relative, baseUrl will be used as base.
   */
  path: string;
  body?: JsonBodyType;
  headers?: Record<string, string>;
  status?: number;

  /**
   * Optional handler which will be called instead of using the body, headers and status
   */
  handler?: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>;
}

export function useMockRequestHandler<
  Params extends PathParams<keyof Params> = PathParams,
  RequestBodyType extends DefaultBodyType = DefaultBodyType,
  ResponseBodyType extends DefaultBodyType = undefined,
>({
  baseUrl: requestBaseUrl,
  method,
  path,
  body,
  headers,
  status,
  handler,
}: MockRequestHandlerOptions<Params, RequestBodyType, ResponseBodyType>) {
  let requestUrl = "";
  let receivedRequest: StrictRequest<DefaultBodyType>;
  let receivedCookies: Record<string, string> = {};

  const resolvedPath = toAbsoluteURL(path, requestBaseUrl);

  server.use(
    http[method]<Params, RequestBodyType, ResponseBodyType>(resolvedPath, (args) => {
      requestUrl = args.request.url;
      receivedRequest = args.request.clone();
      receivedCookies = { ...args.cookies };

      if (handler) {
        return handler(args);
      }

      return HttpResponse.json(body as any, {
        status: status ?? 200,
        headers,
      }) as AsyncResponseResolverReturnType<ResponseBodyType>;
    }),
  );

  return {
    getRequestCookies: () => receivedCookies,
    getRequest: () => receivedRequest,
    getRequestUrl: () => new URL(requestUrl),
  };
}
