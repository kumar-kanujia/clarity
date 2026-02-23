import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export const AppHeader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex justify-start items-center h-full border-b",
        className
      )}
    >
      <div className="w-20 h-full" data-tauri-drag-region />
      <header className="flex justify-start items-center h-full w-full">
        <div className="px-1">
          <SidebarTrigger variant="ghost" />
        </div>
        <div
          className="flex-1 w-full h-full select-none"
          data-tauri-drag-region
        />
      </header>
    </div>
  )
}
