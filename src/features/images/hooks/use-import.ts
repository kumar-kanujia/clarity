import { importImages } from "@/tauri"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { open } from "@tauri-apps/plugin-dialog"
import { allImagesQueryKey } from "../queries"

type Uploadtype = "images" | "folders"

const allowedExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"]

export const useSelectFiles = () => {
  const selectFiles = async (uploadType: Uploadtype) => {
    const files = await open({
      multiple: true,
      directory: uploadType === "folders",
      filters: [
        {
          name: "Images",
          extensions: allowedExtensions
        }
      ]
    })
    return files ?? []
  }

  return { selectFiles }
}

export const useImport = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (paths: string[]) => {
      const images = await importImages({ paths })
      return images
    },
    onSuccess: () => {
      return Promise.all([
        qc.invalidateQueries({ queryKey: allImagesQueryKey })
      ])
    }
  })
}
