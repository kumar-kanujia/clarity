import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { AppHeader } from "@/features/common/components/app-header"

import { useTheme } from "@/features/common/providers/theme-provider"
import { createFileRoute } from "@tanstack/react-router"
import { Moon, Sun } from "lucide-react"

export const Route = createFileRoute("/settings")({
  component: RouteComponent
})

function RouteComponent() {
  const { setTheme, theme } = useTheme()
  return (
    <div className="size-full">
      <AppHeader />
      <div className="flex size-full flex-col items-center justify-start pt-16">
        <Card className="min-w-lg">
          <CardHeader className="border-b">
            <CardTitle>Settings</CardTitle>
            <CardDescription>Change settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-10 w-full items-center justify-between px-4">
              <div className="text-muted-foreground">Dark Mode</div>

              <Button
                variant="outline"
                onClick={() => {
                  setTheme(theme === "light" ? "dark" : "light")
                }}
              >
                <Sun className="scale-125 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="scale-0 rotate-90 transition-all dark:scale-125 dark:rotate-0" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
