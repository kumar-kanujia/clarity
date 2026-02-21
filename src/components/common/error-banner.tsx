import { AlertCircle } from "lucide-react"

export const ErrorBanner = ({
  message = "Failed to load more images",
  action
}: {
  message?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="w-full mb-4 px-4 py-3 rounded-lg border border-destructive/20 bg-destructive/5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="w-4 h-4" />
        <span>{message}</span>
      </div>

      {action && action}
    </div>
  )
}
