import type { $Read, $Write, Readable, Writable } from "../src/index.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
type Id = string & { readonly __brand: "Id" };
type Callable = (value: string) => number;
type Payload = { id: $Read<number>; name: string; password?: $Write<string>; optional?: null };

export type ReadWriteContracts = [
  Expect<Equal<Readable<readonly string[]>, readonly string[]>>,
  Expect<Equal<Writable<readonly string[]>, readonly string[]>>,
  Expect<Equal<Readable<[string, number]>, [string, number]>>,
  Expect<Equal<Writable<[string, number]>, [string, number]>>,
  Expect<Equal<Readable<readonly [string, number]>, readonly [string, number]>>,
  Expect<Equal<Readable<Id>, Id>>,
  Expect<Equal<Writable<Id>, Id>>,
  Expect<Readable<Date> extends Date ? true : false>,
  Expect<Writable<Date> extends Date ? true : false>,
  Expect<Equal<Readable<Callable>, Callable>>,
  Expect<Equal<Writable<Callable>, Callable>>,
  Expect<Equal<keyof Readable<{ value?: null }>, "value">>,
  Expect<Equal<Writable<{ value?: null }>["value"], null | undefined>>,
  Expect<Equal<keyof Readable<Payload>, "id" | "name" | "optional">>,
  Expect<Equal<Readable<Payload>["id"], number>>,
  Expect<Equal<Readable<Payload>["optional"], null | undefined>>,
  Expect<Equal<Writable<Payload>["password"], string | undefined>>,
  Expect<Equal<Writable<Payload>["id"], undefined>>,
];
