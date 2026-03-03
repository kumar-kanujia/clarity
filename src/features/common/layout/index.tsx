import type { ReactNode } from "react"
import { AppSidebar } from "../components/app-sidebar"

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AppSidebar />
      {children}
    </>
  )
}
