import { useEffect, type ReactNode } from "react"

import { AppHeader, AppSidebar, InfoSheet } from "../components"
import { useLocation } from "@tanstack/react-router"
import { useInfoStore } from "../store"
import { useSelectStore } from "@/features/images/store"

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()

  const { closeInfoSheet } = useInfoStore()
  const { reset } = useSelectStore()

  useEffect(() => {
    closeInfoSheet()
    reset()
  }, [pathname])

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
