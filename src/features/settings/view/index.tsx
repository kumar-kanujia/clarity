import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/providers/theme-provider"

export const SettingsView = () => {
  const { setTheme } = useTheme()
  return (
    <div className="size-full flex flex-col items-center justify-start pt-16">
      <Card className="min-w-lg">
        <CardHeader className="border-b">
          <CardTitle>Settings</CardTitle>
          <CardDescription>Change settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-10 flex justify-between items-center px-4">
            <div>Theme</div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="lg">
                      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
