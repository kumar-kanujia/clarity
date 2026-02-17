import { SidebarTrigger } from "@/components/ui/sidebar"

export const AppHeader = () => {
  return (
    <header className="flex p-3 items-center justify-between border-b">
      <SidebarTrigger />
    </header>
  )
}
