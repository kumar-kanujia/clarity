import type {
  infiniteQueryOptions,
  UseSuspenseInfiniteQueryOptions
} from "@tanstack/react-query"

export type AnyInfiniteQueryOptions = ReturnType<
  typeof infiniteQueryOptions<any, any, any, any, any>
>

export type AnySuspenseInfiniteQueryOptions = UseSuspenseInfiniteQueryOptions<
  any,
  any,
  any,
  any,
  any
>
