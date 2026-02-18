import { SidebarProvider } from "@/components/ui/sidebar"
import { QueryClientProvider } from "./query-client-provider"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
