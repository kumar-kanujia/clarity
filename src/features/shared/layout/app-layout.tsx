import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/sidebar/ui/app-sidebar"
import { AppHeader } from "../ui/app-header"
import { ImageModal } from "../ui/image-modal"

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
