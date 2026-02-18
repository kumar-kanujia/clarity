import { BinView } from "@/features/bin/view"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/bin")({
  component: BinPage
})

function BinPage() {
  return <BinView />
}
