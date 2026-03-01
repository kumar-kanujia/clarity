import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import type { ImageItem } from "@/tauri"
import { Calendar, FileImage, HardDrive, Monitor } from "lucide-react"

export const Metadata = ({ image }: { image: ImageItem }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium leading-none text-muted-foreground">
        Properties
      </h4>

      <div className="grid gap-4 text-sm">
        <div className="flex items-start gap-3">
          <FileImage className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="grid gap-0.5">
            <span className="font-medium text-foreground">Name</span>
            <Tooltip>
              <TooltipTrigger className={"text-start truncate"}>
                {image.fileName}
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <span>{image.fileName}</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <HardDrive className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="grid gap-0.5">
            <span className="font-medium text-foreground">Size</span>
            <span className="text-muted-foreground">{image.size}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Monitor className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="grid gap-0.5">
            <span className="font-medium text-foreground">Dimensions</span>
            <span className="text-muted-foreground">{image.resolution}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="grid gap-0.5">
            <span className="font-medium text-foreground">Added on</span>
            <span className="text-muted-foreground">{image.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
