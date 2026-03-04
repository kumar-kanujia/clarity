import type { ReactNode } from "react"

import { AppHeader, AppSidebar } from "../components"
import { InfoSheet } from "@/features/images/components"

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <InfoSheet />
    </div>
  )
}
