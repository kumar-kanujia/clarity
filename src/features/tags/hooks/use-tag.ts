import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createTag,
  deleteTag,
  editTag,
  softDeleteTag,
  undoDeleteTag,
  type CreateTagParams,
  type EditTagParams
} from "@/tauri"

import {
  allTagsQueryKey,
  inactiveTagQueryKey,
  topTagsQueryKey
} from "../queries"

export const useCreateTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (params: CreateTagParams) => await createTag(params),

    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey })
      ])
    }
  })

  return { mutate, isPending, isSuccess, isError }
}

export const useEditTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (params: EditTagParams) => {
      await editTag(params)
    },

    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey })
      ])
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}

export const useDeleteTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (tagId: number) => deleteTag({ tagId }),
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: inactiveTagQueryKey })
      ])
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}

export const useSoftDeleteTag = () => {
  const qc = useQueryClient()

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (tagId: number) => softDeleteTag({ tagId }),
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey }),
        qc.invalidateQueries({ queryKey: inactiveTagQueryKey })
      ])
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}

export const useRestoreTag = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (tagId: number) => undoDeleteTag({ tagId }),
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allTagsQueryKey }),
        qc.invalidateQueries({ queryKey: topTagsQueryKey }),
        qc.invalidateQueries({ queryKey: inactiveTagQueryKey })
      ])
    }
  })

  return {
    mutate,
    isPending,
    isError,
    isSuccess
  }
}
