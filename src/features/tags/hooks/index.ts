import {
  QueryClient,
  useMutation,
  useQueryClient,
  type QueryKey
} from "@tanstack/react-query"

import {
  createTag,
  deleteTag,
  editTag,
  markTagActive,
  markTagInactive,
  type CreateTagParams,
  type EditTagParams
} from "@/tauri"

import {
  allTagsQueryKey,
  inactiveTagQueryKey,
  topTagsQueryKey
} from "../queries"

const tagQueryKeys = {
  all: [allTagsQueryKey, topTagsQueryKey],
  inactive: [inactiveTagQueryKey],
  allAndInactive: [allTagsQueryKey, topTagsQueryKey, inactiveTagQueryKey]
}

const invalidateKeys = (qc: QueryClient, keys: QueryKey[]) =>
  Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })))

const useTagMutation = <TParams>(
  mutationFn: (params: TParams) => Promise<unknown>,
  keysToInvalidate: QueryKey[]
) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateKeys(qc, keysToInvalidate)
  })
}

export const useCreateTag = () =>
  useTagMutation(
    (params: CreateTagParams) => createTag(params),
    tagQueryKeys.all
  )

export const useEditTag = () =>
  useTagMutation((params: EditTagParams) => editTag(params), tagQueryKeys.all)

export const useMarkTagInactive = () =>
  useTagMutation(
    (tagId: number) => markTagInactive({ tagId }),
    tagQueryKeys.allAndInactive
  )

export const useMarkTagActive = () =>
  useTagMutation(
    (tagId: number) => markTagActive({ tagId }),
    tagQueryKeys.allAndInactive
  )

export const useDeleteTag = () =>
  useTagMutation((tagId: number) => deleteTag({ tagId }), tagQueryKeys.inactive)
