import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/untagged")({
  component: UntaggedPage
})

function UntaggedPage() {
  return <div>Hello "/untagged"!</div>
}
