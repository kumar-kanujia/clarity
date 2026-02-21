import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <AppHeader className="w-full h-8 shrink-0" />
      <div
        className="relative flex flex-1 w-full overflow-hidden 
        **:data-[slot=sidebar-wrapper]:min-h-full! 
        **:data-[slot=sidebar-container]:absolute! 
        **:data-[slot=sidebar-container]:h-full!"
      >
        <AppSidebar />
        <div className="w-full h-full overflow-y-auto py-2">{children}</div>
      </div>
    </div>
  )
}
