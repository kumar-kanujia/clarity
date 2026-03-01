import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { JSX } from "react"
import { AppHeader } from "../layout/app-header"

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
    <div className="size-full p-4 flex justify-center items-center">
      <div
        className={cn(
          "border-2 border-dashed p-12 rounded-2xl size-[50%]",
          isError && "border-destructive/40"
        )}
      >
        <div className="flex flex-col justify-center items-center gap-4 size-full text-center">
          {isLoading ? (
            <Loader2 className="animate-spin text-muted-foreground size-7" />
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
    <div className="w-full flex flex-col">
      <AppHeader />
      <div className="flex-1">
        <State {...props} />
      </div>
    </div>
  )
}
