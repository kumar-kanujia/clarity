import { AppLayout } from "@/components/layout"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

const RootLayout = () => (
  <AppLayout>
    <Outlet />
    <TanStackRouterDevtools position="bottom-right" />
  </AppLayout>
)

export const Route = createRootRoute({ component: RootLayout })
