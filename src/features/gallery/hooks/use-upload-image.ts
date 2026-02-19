import { importImages } from "@/services/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { open } from "@tauri-apps/plugin-dialog"
import { toast } from "sonner"
import { galleryQueryKey } from "./use-gallery-query-options"

type Uploadtype = "file" | "directory"

const allowedExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"]

export const useUploadImage = () => {
  const qc = useQueryClient()
  const { mutate, isPending, isSuccess, isError, data } = useMutation({
    mutationFn: async (uploadType: Uploadtype) => {
      const files = await open({
        multiple: true,
        directory: uploadType === "directory",
        filters: [
          {
            name: "Images",
            extensions: allowedExtensions
          }
        ]
      })
      if (files && files.length > 0) {
        return await importImages({
          paths: files
        })
      } else {
        throw new Error("No files selected")
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: galleryQueryKey })
    }
  })

  return {
    mutate,
    isPending,
    isSuccess,
    isError,
    data
  }
}
