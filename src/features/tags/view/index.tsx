import { Plus, TagIcon } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CreateTagDialog } from "../components/create-tag-dialog"
import { getAllTagsQueryOption, getInactiveTagsQueryOption } from "../queries"
import { Badge } from "@/components/ui/badge"
import { TagCard } from "../components/tag-card"
import { EditTagDialog } from "../components/edit-tag-dialog"
import { DeleteTagDialog } from "../components/delete-tag-dialog"
import { AppHeader } from "@/features/common/layout/app-header"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"

const EmptyTagState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center min-h-[50vh]">
    <div className="w-20 h-20 bg-muted/30 border rounded-3xl flex items-center justify-center mb-6 shadow-xl">
      <TagIcon className="w-10 h-10 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-bold mb-2">No tags found</h2>
    <p className="text-muted-foreground max-w-sm text-sm">
      Create a custom tag to start categorizing your visual library.
    </p>
  </div>
)

const ActiveTags = () => {
  const { data: tags } = useSuspenseQuery(getAllTagsQueryOption())
  return (
    <>
      {tags.length === 0 ? (
        <EmptyTagState />
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
              Active Tags <Badge>{tags.length}</Badge>
            </span>
          </div>
          <div className="max-h-100 overflow-y-scroll pe-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tags.map((tag) => (
                <TagCard key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const InactiveTags = () => {
  const { data: tags } = useSuspenseQuery(getInactiveTagsQueryOption())

  if (tags.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <div className="mb-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
          Inactive Tags <Badge>{tags.length}</Badge>
        </span>
      </div>
      <div className="h-50 pe-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} isInactive />
          ))}
        </div>
      </div>
    </div>
  )
}

export const TagsView = () => {
  return (
    <div className="flex flex-col size-full bg-background overflow-hidden relative">
      <AppHeader>
        <div className="ms-auto px-4">
          <CreateTagDialog>
            <DialogTrigger render={<Button variant="ghost" />}>
              <Plus /> Create Tag
            </DialogTrigger>
          </CreateTagDialog>
        </div>
      </AppHeader>
      <EditTagDialog />
      <DeleteTagDialog />
      <main className="flex-1 overflow-y-auto p-8">
        <ActiveTags />
        <InactiveTags />
      </main>
    </div>
  )
}
