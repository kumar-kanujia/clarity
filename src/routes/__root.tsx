import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import type { QueryClient } from "@tanstack/react-query"
import { AppLayout } from "@/features/common/layout"
import { Providers } from "@/features/common/providers"

const RootLayout = () => (
  <Providers>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </Providers>
)

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootLayout
})
