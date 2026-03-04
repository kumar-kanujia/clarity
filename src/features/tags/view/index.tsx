import { Plus, TagIcon } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CreateTagDialog } from "../components/create-tag-dialog"
import { getAllTagsQueryOption, getInactiveTagsQueryOption } from "../queries"
import { Badge } from "@/components/ui/badge"
import { TagCard } from "../components/tag-card"
import { EditTagDialog } from "../components/edit-tag-dialog"
import { DeleteTagDialog } from "../components/delete-tag-dialog"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { AppHeader } from "@/features/common/components/app-header"

const EmptyTagState = () => (
  <div className="flex h-full min-h-[25vh] flex-col items-center justify-center text-center">
    <div className="bg-muted/30 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border shadow-xl">
      <TagIcon className="text-muted-foreground h-10 w-10" />
    </div>
    <h2 className="mb-2 text-xl font-bold">No Active tags found</h2>
    <p className="text-muted-foreground max-w-sm text-sm">
      Create a new tag to start categorizing your visual library
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
        <div className="mx-auto max-w-7xl">
          <div className="mb-2">
            <span className="flex items-center justify-between text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Active Tags <Badge>{tags.length}</Badge>
            </span>
          </div>
          <div className="max-h-100 overflow-y-scroll py-4 pe-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <div className="mx-auto mt-4 max-w-7xl">
      <div className="mb-2">
        <span className="flex items-center justify-between text-xs font-bold tracking-widest text-zinc-500 uppercase">
          Inactive Tags <Badge>{tags.length}</Badge>
        </span>
      </div>
      <div className="h-50 py-4 pe-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} isInactive />
          ))}
        </div>
      </div>
    </div>
  )
}

export const TagsView = () => (
  <div className="bg-background relative flex size-full flex-col overflow-hidden">
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
