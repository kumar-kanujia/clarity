import { Plus, TagIcon } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CreateTagDialog } from "../components/create-tag-dialog"
import { getAllTagsQueryOption, getInactiveTagsQueryOption } from "../queries"
import { TagCard } from "../components/tag-card"
import { EditTagDialog } from "../components/edit-tag-dialog"
import { DeleteTagDialog } from "../components/delete-tag-dialog"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { useHeaderSlot } from "@/features/common/providers/header-slot-provider"

const EmptyTagState = () => (
  <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-3 text-center select-none">
    <div className="border-muted-foreground/20 bg-muted/30 flex size-16 items-center justify-center rounded-2xl border border-dashed">
      <TagIcon className="text-muted-foreground/50 size-7" />
    </div>
    <div className="space-y-1">
      <h2 className="text-sm font-semibold">No tags yet</h2>
      <p className="text-muted-foreground/70 max-w-50 text-xs leading-relaxed">
        Create a tag to start organising your library
      </p>
    </div>
  </div>
)

const SectionLabel = ({ label, count }: { label: string; count: number }) => (
  <div className="mb-3 flex items-center justify-between">
    <span className="text-muted-foreground/60 text-[11px] font-semibold tracking-widest uppercase">
      {label}
    </span>
    <span className="text-muted-foreground/50 text-[11px] font-medium tabular-nums">
      {count}
    </span>
  </div>
)

const ActiveTags = () => {
  const { data: tags } = useSuspenseQuery(getAllTagsQueryOption())
  if (tags.length === 0) return <EmptyTagState />
  return (
    <section>
      <SectionLabel label="Active" count={tags.length} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.map((tag) => (
          <TagCard key={tag.id} tag={tag} />
        ))}
      </div>
    </section>
  )
}

const InactiveTags = () => {
  const { data: tags } = useSuspenseQuery(getInactiveTagsQueryOption())
  if (tags.length === 0) return null

  return (
    <section className="mt-8">
      <SectionLabel label="Inactive" count={tags.length} />
      <div className="grid grid-cols-1 gap-3 opacity-75 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tags.map((tag) => (
          <TagCard key={tag.id} tag={tag} isInactive />
        ))}
      </div>
    </section>
  )
}

const TagsHeaderActions = (
  <div className="ms-auto px-4">
    <CreateTagDialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-sm"
          />
        }
      >
        <Plus className="size-3.5" /> Create tag
      </DialogTrigger>
    </CreateTagDialog>
  </div>
)

export const TagsView = () => {
  useHeaderSlot(TagsHeaderActions)

  return (
    <div className="bg-background relative flex size-full flex-col overflow-hidden">
      <EditTagDialog />
      <DeleteTagDialog />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <ActiveTags />
          <InactiveTags />
        </div>
      </main>
    </div>
  )
}
