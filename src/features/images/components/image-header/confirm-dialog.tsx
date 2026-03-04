import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { type ReactNode } from "react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  isPending: boolean
  onConfirm: () => void
}

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm
}: ConfirmDialogProps) => (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>{description}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        disabled={isPending}
        onClick={onConfirm}
        className="bg-red-500 hover:bg-red-600 focus-visible:ring-red-500"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          confirmLabel
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
)
