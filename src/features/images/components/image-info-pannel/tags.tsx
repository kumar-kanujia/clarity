import { useQuery } from "@tanstack/react-query"
import {
  getAttachedTagsQueryOptions,
  getAvailableTagsQueryOptions
} from "../../queries"
import { useToggleTag } from "../../hooks"
import { Loader2, Tag, X } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "@/components/ui/combobox"
import type { TagItem } from "@/tauri"
import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"

interface TagsProps {
  imageId: number
}

const TagPill = ({
  tag,
  onRemove,
  disabled
}: {
  tag: TagItem
  onRemove: () => void
  disabled: boolean
}) => (
  <div
    className="group flex items-center gap-1.5 p-1 rounded-md text-xs font-medium border transition-all duration-150 hover:shadow-sm"
    style={{
      borderColor: `${tag.tagColor}35`,
      color: tag.tagColor,
      backgroundColor: `${tag.tagColor}12`
    }}
  >
    <Tag className="w-3 h-3 opacity-60 shrink-0" />
    <Link
      to="/tags/$tagid"
      params={{ tagid: `${tag.id}` }}
      className="hover:underline underline-offset-2 transition-opacity hover:opacity-75 leading-none"
    >
      {tag.tagName}
    </Link>
    <button
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        onRemove()
      }}
      aria-label={`Remove tag ${tag.tagName}`}
      className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-70 hover:opacity-100! transition-opacity hover:bg-black/10 disabled:cursor-not-allowed"
      style={{ color: tag.tagColor }}
    >
      <X className="w-2.5 h-2.5" />
    </button>
  </div>
)

const AttachedTags = ({ imageId }: TagsProps) => {
  const { data: attachedTags, isLoading } = useQuery(
    getAttachedTagsQueryOptions(imageId, 20)
  )
  const { mutate, isPending } = useToggleTag()

  return (
    <div className="min-h-13 flex items-start">
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading tags…</span>
        </div>
      ) : attachedTags && attachedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2 py-2">
          {attachedTags.map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              disabled={isPending}
              onRemove={() => mutate({ imageId, tagId: tag.id })}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 py-1 italic">
          No tags yet — attach one below.
        </p>
      )}
    </div>
  )
}

const AddTag = ({ imageId }: TagsProps) => {
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    setInputValue("")
    setSelectedTag(null)
  }, [imageId])

  const { data: availableTags, isLoading } = useQuery(
    getAvailableTagsQueryOptions(imageId, 20)
  )
  const { mutate, isPending } = useToggleTag()

  const filteredTags = availableTags?.filter((tag) =>
    tag.tagName.toLowerCase().includes(inputValue.toLowerCase())
  )

  const attachSelected = () => {
    if (!selectedTag) return
    mutate({ tagId: selectedTag.id, imageId })
    setSelectedTag(null)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") attachSelected()
  }

  return (
    <Combobox
      items={filteredTags}
      disabled={isLoading || isPending}
      autoHighlight
      value={selectedTag}
      onValueChange={(value) => {
        setSelectedTag(value)
        setInputValue(value?.tagName ?? "")
      }}
    >
      <ComboboxInput
        placeholder={isLoading ? "Loading…" : "Attach a new tag"}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setSelectedTag(null)
        }}
        onKeyDown={handleKeyDown}
        style={{ color: selectedTag?.tagColor }}
      />
      <ComboboxContent>
        <ComboboxEmpty>No tags available.</ComboboxEmpty>
        <ComboboxList>
          {(tag: TagItem) => (
            <ComboboxItem
              key={tag.id}
              value={tag}
              style={{ color: tag.tagColor }}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              {tag.tagName}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Tags = ({ imageId }: TagsProps) => (
  <section className="space-y-3">
    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
      Tags
    </h4>

    <div className="rounded-xl border border-border/60 bg-background/30  overflow-hidden">
      <div className="px-4 py-3">
        <AttachedTags imageId={imageId} />
      </div>
      <div className="px-4 py-3">
        <AddTag imageId={imageId} />
      </div>
    </div>
  </section>
)
