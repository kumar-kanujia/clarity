import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { TooltipProvider } from "@/components/ui/tooltip"

import { SidebarProvider } from "../ui/sidebar"
import { ThemeProvider } from "./theme-provider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={false}>
        <TooltipProvider>{children}</TooltipProvider>
      </SidebarProvider>
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </ThemeProvider>
  )
}
