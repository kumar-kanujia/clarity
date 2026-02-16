import * as ReactQuery from "@tanstack/react-query"

const queryClient = new ReactQuery.QueryClient()
export const QueryClientProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <ReactQuery.QueryClientProvider client={queryClient}>
      {children}
    </ReactQuery.QueryClientProvider>
  )
}
