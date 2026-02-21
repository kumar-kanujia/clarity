import { Palette, Plus } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { type CreateTagParams } from "@/services/tauri"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCreateTag } from "../hooks"
import { useCallback, useState } from "react"

const TAG_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6" // teal
] as const

type TagColor = (typeof TAG_COLORS)[number]

export const CreateTagDialog = () => {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<CreateTagParams>({
    defaultValues: {
      tagName: "",
      color: TAG_COLORS[0]
    }
  })

  const { mutate, isPending } = useCreateTag()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        form.reset({
          tagName: "",
          color: TAG_COLORS[0]
        })
      }
    },
    [form]
  )

  const onSubmit = useCallback(
    (data: CreateTagParams) => {
      mutate(data, {
        onSuccess: () => {
          handleOpenChange(false)
        },
        onError: () => {
          form.setError("tagName", {
            type: "server",
            message:
              "Tag with this name already exists. Please choose a different name."
          })
        }
      })
    },
    [mutate, form, handleOpenChange]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={"outline"} size={"lg"}>
            <Plus className="size-6" />
            New Tag
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="create-tag-form"
          className="contents"
        >
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <FieldGroup>
              {/* TAG NAME */}
              <Controller
                name="tagName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Name
                    </Label>

                    <Input
                      {...field}
                      autoFocus
                      placeholder="e.g. Travel, Summer 2024"
                      disabled={isPending}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="color"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      Color
                    </Label>

                    <ToggleGroup
                      multiple={false}
                      value={[field.value]}
                      onValueChange={(value: string[]) => {
                        if (value) field.onChange(value[0] as TagColor)
                      }}
                      disabled={isPending}
                      spacing={2}
                      size={"sm"}
                    >
                      {TAG_COLORS.map((color) => (
                        <ToggleGroupItem
                          variant={"outline"}
                          key={color}
                          value={color}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-all",
                            field.value === color
                              ? "border-foreground scale-110"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </ToggleGroup>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="rounded-full">
                  Cancel
                </Button>
              }
            />
            <Button
              className="rounded-full"
              type="submit"
              form="create-tag-form"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
