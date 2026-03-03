import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { JSX } from "react"
import { AppHeader } from "./app-header"

type StateVariant = "empty" | "loading" | "error"

export const State = ({
  variant,
  message,
  icon,
  action
}: {
  variant: StateVariant
  message?: string
  icon?: JSX.Element
  action?: React.ReactNode
}) => {
  const isError = variant === "error"
  const isLoading = variant === "loading"

  return (
    <div className="flex size-full items-center justify-center p-4">
      <div
        className={cn(
          "size-[50%] rounded-2xl border-2 border-dashed p-12",
          isError && "border-destructive/40"
        )}
      >
        <div className="flex size-full flex-col items-center justify-center gap-4 text-center">
          {isLoading ? (
            <Loader2 className="text-muted-foreground size-7 animate-spin" />
          ) : (
            icon
          )}

          <p
            className={
              isError ? "text-destructive font-medium" : "text-muted-foreground"
            }
          >
            {message}
          </p>

          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  )
}

export const StateWithHeader = ({
  ...props
}: {
  variant: StateVariant
  message?: string
  icon?: JSX.Element
  action?: React.ReactNode
}) => {
  return (
    <div className="flex w-full flex-col">
      <AppHeader />
      <div className="flex-1">
        <State {...props} />
      </div>
    </div>
  )
}
