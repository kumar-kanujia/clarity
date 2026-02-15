import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Banner */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 bg-zinc-950/50 backdrop-blur-md z-40">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-bold tracking-widest text-white uppercase text-xs">
                Clarity
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {/* Optional top-right actions could go here */}
            </div>
          </div>

          <div className="flex-1 overflow-auto relative custom-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>
      <TanStackRouterDevtools />
    </SidebarProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
