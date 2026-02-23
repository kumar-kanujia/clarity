import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { AppLayout } from "@/components/layout"
import { Providers } from "@/components/providers"
import type { QueryClient } from "@tanstack/react-query"

const RootLayout = () => (
  <Providers>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </Providers>
)

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({ component: RootLayout })
