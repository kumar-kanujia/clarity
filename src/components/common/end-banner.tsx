import { BoomBoxIcon } from "lucide-react"

export const EndBanner = ({ text = "No more items" }) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
      <BoomBoxIcon className="w-8 h-8 mb-2 opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
