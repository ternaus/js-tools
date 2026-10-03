import {
  type DataTag,
  type InfiniteData,
  type QueryClient,
  type QueryFunctionContext,
  type SkipToken,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  CheckedInit,
  ClientMethod,
  DefaultParamsOption,
  Client as FetchClient,
  FetchResponse,
  MaybeOptionalInit,
} from "@ternaus/openapi-fetch";
import type { HttpMethod, MediaType, PathsWithMethod, RequiredKeysOf } from "@ternaus/openapi-typescript-helpers";

type InferSelectReturnType<TData, TSelect> = TSelect extends (data: TData) => infer R ? R : TData;

type QueryData<T> = [T] extends [never] ? null : T extends undefined ? null : T;

type QueryInit<Init, Options> = CheckedInit<Init, Options> & { [K in keyof UseQueryOptions]?: never } & {
  [key: string]: unknown;
};

export type QueryKey<
  Paths extends Record<string, Record<HttpMethod, {}>>,
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init = MaybeOptionalInit<Paths[Path], Method>,
  Mode extends "query" | "infinite" = "query",
> = readonly [string, string | null, Mode, Method, Path, Init];

export type QueryOptionsFunction<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
  Options extends Omit<
    UseQueryOptions<
      QueryData<Response["data"]>,
      Response["error"] | Error,
      InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
      QueryKey<Paths, Method, Path>
    >,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  path: Path,
  ...[init, options]: RequiredKeysOf<Init> extends never
    ? [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>?, Options?]
    : [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>, Options?]
) => NoInfer<
  Omit<
    UseQueryOptions<
      QueryData<Response["data"]>,
      Response["error"] | Error,
      InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
      QueryKey<Paths, Method, Path>
    >,
    "queryFn" | "queryKey"
  > & {
    queryKey: DataTag<QueryKey<Paths, Method, Path>, QueryData<Response["data"]>, Response["error"] | Error>;
    queryFn: Exclude<
      UseQueryOptions<
        QueryData<Response["data"]>,
        Response["error"] | Error,
        InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
        QueryKey<Paths, Method, Path>
      >["queryFn"],
      SkipToken | undefined
    >;
  }
>;

export type UseQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
  Options extends Omit<
    UseQueryOptions<
      QueryData<Response["data"]>,
      Response["error"] | Error,
      InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
      QueryKey<Paths, Method, Path>
    >,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  url: Path,
  ...[init, options, queryClient]: RequiredKeysOf<Init> extends never
    ? [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>?, Options?, QueryClient?]
    : [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>, Options?, QueryClient?]
) => UseQueryResult<InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>, Response["error"] | Error>;

export type UseInfiniteQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
  Options extends Omit<
    UseInfiniteQueryOptions<
      QueryData<Response["data"]>,
      Response["error"] | Error,
      InferSelectReturnType<InfiniteData<QueryData<Response["data"]>>, Options["select"]>,
      QueryKey<Paths, Method, Path, Init, "infinite">,
      unknown
    >,
    "queryKey" | "queryFn"
  > & {
    pageParamName?: string;
  },
>(
  method: Method,
  url: Path,
  init: QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>,
  options: Options,
  queryClient?: QueryClient,
) => UseInfiniteQueryResult<
  InferSelectReturnType<InfiniteData<QueryData<Response["data"]>>, Options["select"]>,
  Response["error"] | Error
>;

export type UseSuspenseQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
  Options extends Omit<
    UseSuspenseQueryOptions<
      QueryData<Response["data"]>,
      Response["error"] | Error,
      InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
      QueryKey<Paths, Method, Path>
    >,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  url: Path,
  ...[init, options, queryClient]: RequiredKeysOf<Init> extends never
    ? [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>?, Options?, QueryClient?]
    : [QueryInit<Init, MaybeOptionalInit<Paths[Path], Method>>, Options?, QueryClient?]
) => UseSuspenseQueryResult<
  InferSelectReturnType<QueryData<Response["data"]>, Options["select"]>,
  Response["error"] | Error
>;

export type UseMutationMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
  TOnMutateResult = unknown,
>(
  method: Method,
  url: Path,
  options?: Omit<
    UseMutationOptions<
      Response["data"],
      Response["error"] | Error,
      MaybeOptionalInit<Paths[Path], Method>,
      TOnMutateResult
    >,
    "mutationKey" | "mutationFn"
  >,
  queryClient?: QueryClient,
) => UseMutationResult<
  Response["data"],
  Response["error"] | Error,
  MaybeOptionalInit<Paths[Path], Method>,
  TOnMutateResult
>;

export interface OpenapiQueryClient<Paths extends {}, Media extends MediaType = MediaType> {
  queryOptions: QueryOptionsFunction<Paths, Media>;
  useQuery: UseQueryMethod<Paths, Media>;
  useSuspenseQuery: UseSuspenseQueryMethod<Paths, Media>;
  useInfiniteQuery: UseInfiniteQueryMethod<Paths, Media>;
  useMutation: UseMutationMethod<Paths, Media>;
}

export type MethodResponse<
  CreatedClient extends OpenapiQueryClient<any, any>,
  Method extends HttpMethod,
  Path extends CreatedClient extends OpenapiQueryClient<infer Paths, infer _Media>
    ? PathsWithMethod<Paths, Method>
    : never,
  Options = object,
> =
  CreatedClient extends OpenapiQueryClient<infer Paths extends { [key: string]: any }, infer Media extends MediaType>
    ? NonNullable<FetchResponse<Paths[Path][Method], Options, Media>["data"]>
    : never;

export interface ClientOptions {
  cacheKey?: string;
}

export default function createClient<Paths extends {}, Media extends MediaType = MediaType>(
  client: FetchClient<Paths, Media>,
  { cacheKey }: ClientOptions = {},
): OpenapiQueryClient<Paths, Media> {
  const scope = [client.baseUrl, cacheKey ?? null] as const;

  const fetch = async <Method extends HttpMethod, Path extends PathsWithMethod<Paths, Method>>(
    method: Method,
    path: Path,
    init: unknown,
  ) => {
    const fn = client[method.toUpperCase() as Uppercase<Method>] as ClientMethod<Paths, Method, Media>;
    const { data, error, response } = await fn(path, init as any);
    if (!response.ok) {
      throw error === undefined
        ? new Error(`HTTP ${response.status} ${response.statusText}`.trim(), { cause: response })
        : error;
    }
    return data;
  };

  const queryFn = <Method extends HttpMethod, Path extends PathsWithMethod<Paths, Method>>({
    queryKey: [, , , method, path, init],
    signal,
  }: QueryFunctionContext<QueryKey<Paths, Method, Path>>) =>
    fetch(method, path, { signal, ...init }).then((data) => data ?? null);

  const queryOptions: QueryOptionsFunction<Paths, Media> = (method, path, ...[init, options]) => ({
    queryKey: [...scope, "query", method, path, init] as unknown as DataTag<
      QueryKey<Paths, typeof method, typeof path>,
      any,
      any
    >,
    queryFn,
    ...options,
  });

  return {
    queryOptions,
    useQuery: (method, path, ...[init, options, queryClient]) =>
      useQuery(queryOptions(method, path, init as any, options), queryClient),
    useSuspenseQuery: (method, path, ...[init, options, queryClient]) =>
      useSuspenseQuery(queryOptions(method, path, init as any, options), queryClient),
    useInfiniteQuery: (method, path, init, options, queryClient) => {
      const { pageParamName = "cursor", ...restOptions } = options;
      return useInfiniteQuery(
        {
          queryKey: [...scope, "infinite", method, path, init],
          queryFn: ({ queryKey: [, , , method, path, init], pageParam, signal }) => {
            const mergedInit = {
              ...init,
              signal,
              params: {
                ...init?.params,
                query: {
                  ...(init?.params as { query?: DefaultParamsOption })?.query,
                  ...(pageParam === undefined ? {} : { [pageParamName]: pageParam }),
                },
              },
            };
            return fetch(method, path, mergedInit).then((data) => data ?? null);
          },
          ...restOptions,
        },
        queryClient,
      );
    },
    useMutation: (method, path, options, queryClient) =>
      useMutation(
        {
          mutationKey: [...scope, "mutation", method, path],
          mutationFn: (init) => fetch(method, path, init) as any,
          ...options,
        },
        queryClient,
      ),
  };
}
