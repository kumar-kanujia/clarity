import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Ellipsis } from "lucide-react"

export const AppHeader = () => {
  return (
    <header className="flex py-2 px-3 items-center justify-between border-b gap-4">
      <div className="flex-1">
        <Button size={"icon"} variant={"ghost"}>
          <SidebarTrigger />
        </Button>
      </div>
      <div className="flex gap-3">
        <Button size={"icon"} variant={"outline"}>
          <Ellipsis />
        </Button>
      </div>
    </header>
  )
}
