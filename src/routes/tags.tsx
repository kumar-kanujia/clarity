import { createFileRoute } from "@tanstack/react-router";
import { Tag as TagIcon, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/hooks/use-gallery-store";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/tags")({
  component: TagsPage,
});

function TagsPage() {
  const { userTags, systemTags, createTag } = useGalleryStore();
  const [newTagName, setNewTagName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName);
    setNewTagName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest text-white uppercase">
            Tags Management
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
            Organize and manage your custom labels
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary h-9 px-6 hover:scale-105 transition-transform font-bold text-xs uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/5 text-white">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Tag name (e.g. Travel, Family)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-zinc-950 border-white/10"
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTag}
                className="rounded-full bg-primary"
                disabled={!newTagName.trim()}
              >
                Create Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {userTags.length === 0 && systemTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <TagIcon className="w-10 h-10 text-zinc-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">No tags yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm">
              Create your first tag to start organizing your photo collection
              more effectively.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* System Tags Section */}
            {systemTags.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 opacity-50">
                  <Hash className="w-4 h-4" />
                  <h2 className="text-xs font-bold uppercase tracking-widest">
                    System Tags
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {systemTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span className="font-medium text-sm text-white">
                          {tag.tagName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {tag.imageCount} items
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* User Tags Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TagIcon className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                  My Custom Tags
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: tag.tagColor }}
                      />
                      <span className="font-medium text-sm text-white">
                        {tag.tagName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {tag.imageCount} items
                    </span>
                  </div>
                ))}
                {userTags.length === 0 && (
                  <p className="text-sm text-zinc-600 italic px-2">
                    No custom tags created yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
