import type { infiniteQueryOptions } from "@tanstack/react-query"

export type AnyInfiniteQueryOptions = ReturnType<
  typeof infiniteQueryOptions<any, any, any, any, any>
>

export type InferInfiniteQueryFnData<T> =
  T extends ReturnType<
    typeof infiniteQueryOptions<infer TQueryFnData, any, any, any, any>
  >
    ? TQueryFnData
    : never

export type InfiniteQueryOptionsFactory = () => AnyInfiniteQueryOptions
