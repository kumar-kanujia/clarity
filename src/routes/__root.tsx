import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/ui/components/app-sidebar";
import { PanelView } from "@/features/ui/components/panel-view";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <AppSidebar />
        <PanelView />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Banner */}
          <div className="h-14 flex items-center px-6 bg-zinc-950/20 backdrop-blur-md z-40 relative">
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
