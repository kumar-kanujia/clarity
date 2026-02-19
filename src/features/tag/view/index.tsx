import { Edit2, TagIcon, Trash2 } from "lucide-react"

import { CreateTagDialog } from "../components/create-tag-dialog"
import { useQuery } from "@tanstack/react-query"
import { useGetAllTags } from "../hooks/use-user-tag-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

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
                    <Card
                      key={tag.id}
                      className="group relative overflow-hidden border bg-background hover:border-primary/50 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                              style={{ backgroundColor: `${tag.tagColor}15` }}
                            >
                              <TagIcon
                                className="w-5 h-5"
                                style={{ color: tag.tagColor }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="font-bold text-base tracking-tight">
                                {tag.tagName}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                  variant={"outline"}
                                  className="text-[10px] font-mono h-5 px-1.5 rounded-md bg-muted/50 border-none"
                                >
                                  {tag.imageCount} items
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center  gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Edit2 />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-destructive"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
