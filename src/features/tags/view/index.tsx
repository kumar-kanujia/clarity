import { TagIcon } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { CreateTagDialog } from "../components/create-tag-dialog"
import { TagCard } from "../components/tag-card"
import { DeleteTagDialog } from "../components/delete-tag-dialog"
import { EditTagDialog } from "../components/edit-tag-dialog"
import { getAllTagsQueryOption } from "../hooks"

const TagHeader = () => (
  <header className="h-16 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
    <div className="flex flex-col">
      <h1 className="text-sm font-bold tracking-widest uppercase">
        Management
      </h1>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
        Organize your images with Tags
      </p>
    </div>
    <CreateTagDialog />
  </header>
)

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

export const TagsView = () => {
  const { data: tags } = useSuspenseQuery(getAllTagsQueryOption())

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <EditTagDialog />
      <DeleteTagDialog />
      <TagHeader />
      <main className="flex-1 overflow-y-auto p-8">
        {tags.length === 0 ? (
          <EmptyTagState />
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tags.map((tag) => (
                <TagCard key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
