import { ImageIcon } from "lucide-react"

export const EmptyState = ({
  title = "Nothing here yet",
  description = "Add some images to get started!",
  action
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="w-full h-full py-20 flex flex-col items-center justify-center text-center text-muted-foreground">
      <div className="mb-4 opacity-60">
        <ImageIcon className="w-12 h-12" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>

      {/* Description */}
      <p className="text-sm mt-1 max-w-sm opacity-80">{description}</p>

      {/* Optional action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
