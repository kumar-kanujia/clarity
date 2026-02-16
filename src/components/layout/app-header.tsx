import { SidebarTrigger } from "../ui/sidebar"

export const AppHeader = () => {
  return (
    <header className="flex h-12 items-center justify-between px-4 py-2">
      <SidebarTrigger />
    </header>
  )
}
