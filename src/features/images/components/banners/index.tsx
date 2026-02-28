import { BoomBoxIcon, AlertCircle, Loader } from "lucide-react"

export const EndBanner = ({ text = "No more items" }) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
      <BoomBoxIcon className="w-8 h-8 mb-2 opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export const LoadingBanner = () => {
  return (
    <div className="w-full h-10 flex justify-center items-center">
      <Loader className="animate-spin" />
    </div>
  )
}

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
