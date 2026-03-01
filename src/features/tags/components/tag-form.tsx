import { useEffect } from "react"
import { Palette } from "lucide-react"
import { Controller, useForm, type UseFormSetError } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const ColorEnum = z.enum(
  [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#3b8832" // green
  ],
  {
    error: "Please select a valid color from the palette."
  }
)

export const TAG_COLORS = ColorEnum.options

export const tagFormSchema = z.object({
  tagText: z
    .string()
    .min(3, "Tag must be at least 3 characters.")
    .max(8, "Tag cannot exceed 8 characters."),
  color: ColorEnum
})

export type TagFormValues = z.infer<typeof tagFormSchema>

interface TagFormProps {
  title: string
  submitLabel: string
  isPending: boolean
  defaultValues: TagFormValues
  onCancel: () => void
  onSubmit: (
    data: TagFormValues,
    setError: UseFormSetError<TagFormValues>
  ) => void
}

export const TagForm = ({
  title,
  submitLabel,
  isPending,
  defaultValues,
  onCancel,
  onSubmit
}: TagFormProps) => {
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const handleSubmit = (data: TagFormValues) => {
    onSubmit(data, form.setError)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <FieldGroup>
            {/* TAG TEXT */}
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
                    placeholder="e.g. trv-24"
                    disabled={isPending}
                    onChange={(e) => {
                      const formattedValue = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                      field.onChange(formattedValue)
                    }}
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
              render={({ field, fieldState }) => (
                <Field>
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    Color
                  </Label>
                  <ToggleGroup
                    multiple={false}
                    value={[field.value]}
                    onValueChange={(value: string[]) => {
                      if (value && value.length > 0) field.onChange(value[0])
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
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button className="rounded-full" type="submit" disabled={isPending}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
