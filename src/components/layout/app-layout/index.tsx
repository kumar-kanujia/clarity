import { SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "./app-header"
import { ImageModal } from "@/components/common/image-modal"
import { AppSidebar } from "./app-sidebar"

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ImageModal />
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="h-screen w-full overflow-y-auto">{children}</div>
      </SidebarInset>
    </>
  )
}
