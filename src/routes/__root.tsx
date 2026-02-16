import { Layout } from "@/components/layout"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

const RootLayout = () => (
  <Layout>
    <Outlet />
    <TanStackRouterDevtools position="bottom-right" />
  </Layout>
)

export const Route = createRootRoute({ component: RootLayout })
