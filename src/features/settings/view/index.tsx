import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/theme-provider"

export const SettingsView = () => {
  const { setTheme, theme } = useTheme()
  return (
    <div className="size-full flex flex-col items-center justify-start pt-16">
      <Card className="min-w-lg">
        <CardHeader className="border-b">
          <CardTitle>Settings</CardTitle>
          <CardDescription>Change settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-10 flex justify-between items-center px-4">
            <div>Dark Mode</div>
            <div>
              <Button variant="outline" size="lg">
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => {
                    setTheme(theme === "light" ? "dark" : "light")
                  }}
                >
                  <Sun className="scale-150 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="scale-0 rotate-90 transition-all dark:scale-150 dark:rotate-0" />
                </Button>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
