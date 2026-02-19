import { SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="h-screen w-full overflow-y-auto">{children}</div>
      </SidebarInset>
    </>
  )
}
