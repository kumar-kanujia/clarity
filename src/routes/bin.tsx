import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/bin")({
  component: BinPage
})

function BinPage() {
  return <div>Hello "/bin"!</div>
}
