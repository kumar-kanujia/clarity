import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider } from "@/components/ui/sidebar"

import { ThemeProvider } from "./theme-provider"
import { HeaderSlotProvider } from "./header-slot-provider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <HeaderSlotProvider>{children}</HeaderSlotProvider>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
