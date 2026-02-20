import { TagIcon } from "lucide-react"

import { CreateTagDialog } from "../components/create-tag-dialog"
import { useQuery } from "@tanstack/react-query"
import { useGetAllTags } from "../hooks/use-user-tag-query"

import { TagCard } from "../components/tag-card"
import { DeleteTagDialog } from "../components/delete-tag-dialog"
import { EditTagDialog } from "../components/edit-tag-dialog"

const TagHeader = () => (
  <header className="h-16 border-b flex items-center justify-between px-16 bg-background/50 backdrop-blur-md sticky top-0 z-30">
    <div className="flex flex-col">
      <h1 className="text-sm font-bold tracking-widest uppercase">
        Management
      </h1>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
        Organize your collection with Tags
      </p>
    </div>
    <CreateTagDialog />
  </header>
)

export const TagView = () => {
  const { queryOption } = useGetAllTags()

  const { data: tags, isLoading, isSuccess } = useQuery(queryOption)

  return (
    <>
      <EditTagDialog />
      <DeleteTagDialog />
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <TagHeader />
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading tags...</p>
            </div>
          )}
          {isSuccess &&
            (tags.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-muted/30 border rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                  <TagIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">No tags found</h2>
                <p className="text-muted-foreground max-w-sm mb-8 text-sm">
                  Create a custom tag to start categorizing your visual library.
                </p>
              </div>
            ) : (
              <div className="space-y-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tags.map((tag) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
