import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/settings")({
  component: SettingPage
})

function SettingPage() {
  return <div>Hello "/settings"!</div>
}
