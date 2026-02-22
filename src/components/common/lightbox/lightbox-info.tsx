import { Loader2, Calendar, Monitor, HardDrive } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import type { ImageItem } from "@/services/tauri"
import { useQuery } from "@tanstack/react-query"
import { getAttachedTagsQueryOptions } from "@/features/tags/hooks"

interface LightboxInfoProps {
  image: ImageItem
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
  isSheetOpen: boolean
  children: React.ReactElement
}

export const LightboxInfo = ({
  image,
  setIsSheetOpen,
  isSheetOpen,
  children
}: LightboxInfoProps) => {
  const { data: attachedTags, isLoading: isTagsLoading } = useQuery({
    ...getAttachedTagsQueryOptions(image.id, 50),
    enabled: isSheetOpen
  })

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger render={children} />
      <SheetContent className="z-100 bg-zinc-950/95 backdrop-blur-2xl border-zinc-800 text-white shadow-2xl overflow-y-auto sm:max-w-md w-full p-6">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-white text-left text-lg leading-tight wrap-break-word">
            {image.fileName}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              File Details
            </h3>
            <div className="bg-zinc-900/50 rounded-xl p-4 space-y-4 border border-zinc-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Size
                </span>
                <span className="font-medium text-zinc-100">{image.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Resolution
                </span>
                <span className="font-medium text-zinc-100">
                  {image.resolution}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Added
                </span>
                <span className="font-medium text-zinc-100">
                  {new Date(image.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
              Tags
            </h3>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 flex flex-col gap-4">
              {isTagsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                </div>
              ) : attachedTags && attachedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attachedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-default"
                      style={{
                        borderColor: `${tag.tagColor}40`,
                        color: tag.tagColor,
                        backgroundColor: `${tag.tagColor}1A`
                      }}
                    >
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-2">
                  No tags attached.
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
