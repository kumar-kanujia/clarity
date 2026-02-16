import { SidebarProvider } from "../ui/sidebar"
import { TooltipProvider } from "../ui/tooltip"
import { QueryClientProvider } from "./query-client-provider"
import { ThemeProvider } from "./theme-provider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider>
        <SidebarProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
