import { Palette } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { type EditTagParams } from "@/services/tauri"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEditTag } from "../hooks"
import { useCallback, useEffect } from "react"
import { useEditTagStore } from "../store/edit-tag-store"

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

export const EditTagDialog = () => {
  const { isOpen, tag, closeEditDialog } = useEditTagStore()

  const { mutate, isPending } = useEditTag()

  const form = useForm<EditTagParams>({
    defaultValues: {
      tagId: 0,
      tagText: "",
      tagColor: TAG_COLORS[0]
    }
  })

  console.log(form.getValues(), tag)

  useEffect(() => {
    if (tag) {
      form.setValue("tagId", tag.id)
      form.setValue("tagText", tag.tagName)
      form.setValue("tagColor", tag.tagColor)
    }
  }, [tag, form])

  const onSubmit = useCallback(
    (data: EditTagParams) => {
      mutate(data, {
        onSuccess: () => {
          closeEditDialog()
        },
        onError: () => {
          form.setError("tagText", {
            type: "server",
            message:
              "Tag with this name already exists. Please choose a different name."
          })
        }
      })
    },
    [mutate, form, closeEditDialog]
  )

  if (!tag) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeEditDialog}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="update-tag-form"
          className="contents"
        >
          <DialogHeader>
            <DialogTitle>Update Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <FieldGroup>
              {/* TAG NAME */}
              <Controller
                name="tagText"
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
                name="tagColor"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      Color
                    </Label>

                    <ToggleGroup
                      multiple={false}
                      value={[field.value || TAG_COLORS[0]]}
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
                              ? "border-foreground scale-110 border"
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
              form="update-tag-form"
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
