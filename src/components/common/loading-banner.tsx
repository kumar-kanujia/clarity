import { Loader } from "lucide-react"

export const LoadingBanner = () => {
  return (
    <div className="w-full h-10 flex justify-center items-center">
      <Loader className="animate-spin" />
    </div>
  )
}
