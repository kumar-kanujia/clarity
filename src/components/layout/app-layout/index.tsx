import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppSidebar />
      <div className="flex flex-col h-screen w-full">
        <AppHeader />
        <div className="flex-1 w-full overflow-y-auto">{children}</div>
      </div>
    </>
  )
}
