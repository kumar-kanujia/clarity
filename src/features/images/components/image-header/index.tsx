import { cn } from "@/lib/utils"

export * from "./move-to-trash"
export * from "./empty-trash"
export * from "./restore-images"
export * from "./remove-selected"
export * from "./tag-action"
export * from "./header"
export * from "./confirm-dialog"

export const actionBtn = "h-8 px-2.5 gap-1.5 rounded-lg text-sm font-normal"
export const destructiveBtn = cn(
  actionBtn,
  "hover:text-red-500 hover:bg-red-500/10"
)
