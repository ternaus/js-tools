/** Marker for properties excluded from request bodies. */
export type $Read<T> = { readonly $read: T };

/** Marker for properties excluded from response bodies. */
export type $Write<T> = { readonly $write: T };

type IsMarker<T, Marker> = [NonNullable<T>] extends [never] ? false : NonNullable<T> extends Marker ? true : false;
type Scalar = string | number | boolean | bigint | symbol | null | undefined;
type Callable = (...args: never[]) => unknown;

/** Resolve response data by excluding $Write properties and unwrapping $Read properties. */
export type Readable<T> =
  T extends $Write<unknown>
    ? never
    : T extends $Read<infer U>
      ? Readable<U>
      : T extends Scalar | Callable
        ? T
        : T extends readonly unknown[]
          ? { [K in keyof T]: Readable<T[K]> }
          : T extends object
            ? { [K in keyof T as IsMarker<T[K], $Write<unknown>> extends true ? never : K]: Readable<T[K]> }
            : T;

/** Resolve request data by excluding $Read properties and unwrapping $Write properties. */
export type Writable<T> =
  T extends $Read<unknown>
    ? never
    : T extends $Write<infer U>
      ? Writable<U>
      : T extends Scalar | Callable
        ? T
        : T extends readonly unknown[]
          ? { [K in keyof T]: Writable<T[K]> }
          : T extends object
            ? { [K in keyof T as IsMarker<T[K], $Read<unknown>> extends true ? never : K]: Writable<T[K]> } & {
                [K in keyof T as IsMarker<T[K], $Read<unknown>> extends true ? K : never]?: never;
              }
            : T;
