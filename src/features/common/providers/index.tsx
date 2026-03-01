import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "./theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
