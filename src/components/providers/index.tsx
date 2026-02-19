import { SidebarProvider } from "../ui/sidebar"
import { QueryClientProvider } from "./query-client-provider"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider>
        <SidebarProvider defaultOpen={false}>
          <TooltipProvider>{children}</TooltipProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
