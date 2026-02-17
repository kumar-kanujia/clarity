import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/sidebar/ui/app-sidebar"
import { AppHeader } from "../ui/app-header"

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
