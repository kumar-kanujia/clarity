import { importImages } from "@/services/tauri"
import { open } from "@tauri-apps/plugin-dialog"
import { toast } from "sonner"

type Uploadtype = "file" | "directory"

const allowedExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "heic"]

export const useUploadImage = () => {
  return async (uploadType: Uploadtype) => {
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
      let res = await importImages({
        paths: files
      })
      toast.success(`Imported ${res.totalImported} images`, {
        description: `Skipped ${res.skipped} images`
      })
    } else {
      throw new Error("No files selected")
    }
  }
}
