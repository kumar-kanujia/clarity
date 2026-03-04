import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type StateVariant = "loading" | "error" | "empty"

export interface StateProps {
  variant: StateVariant
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const State = ({ variant, message, icon, action }: StateProps) => {
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
            className={cn(
              isError ? "text-destructive font-medium" : "text-muted-foreground"
            )}
          >
            {message}
          </p>

          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  )
}
