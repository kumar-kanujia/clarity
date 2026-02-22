import { AlertTriangle } from "lucide-react"

export const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load the images. Please try again.",
  action
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="w-full h-full py-20 flex flex-col items-center justify-center text-center">
      {/* Icon */}
      <div className="mb-4 text-destructive opacity-80">
        <AlertTriangle className="w-12 h-12" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {/* Description */}
      <p className="text-sm mt-1 max-w-sm text-muted-foreground">
        {description}
      </p>

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
