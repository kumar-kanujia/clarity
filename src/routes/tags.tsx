import { createFileRoute } from "@tanstack/react-router";
import {
  Tag as TagIcon,
  Plus,
  Hash,
  Trash2,
  Palette,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTagStore } from "@/features/tags/hooks/use-tag-store";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tags")({
  component: TagsPage,
});

const TAG_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

function TagsPage() {
  const { userTags, systemTags, createTag, deleteTag } = useTagStore();
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName);
    setNewTagName("");
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (tagToDelete !== null) {
      await deleteTag(tagToDelete);
      setTagToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="h-16 border-b flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-widest uppercase">
            Management
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Organize your collection with labels
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-9 px-6 hover:scale-105 transition-transform font-bold text-xs uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Name
                </label>
                <Input
                  placeholder="e.g. Travel, Summer 2024"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-primary scale-110 shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTag}
                className="rounded-full"
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
            {/* User Tags Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <TagIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest">
                    Your Labels
                  </h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                    Personal categorization
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userTags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="group relative overflow-hidden border bg-background hover:border-primary/50 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
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
                                variant="secondary"
                                className="text-[10px] font-mono h-5 px-1.5 rounded-md bg-muted/50 border-none"
                              >
                                {tag.imageCount} items
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl p-2 w-48 shadow-2xl backdrop-blur-xl"
                          >
                            <DropdownMenuItem className="rounded-xl">
                              <Edit2 className="w-4 h-4 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              onClick={() => {
                                setTagToDelete(tag.id); // Assuming tag.id is the correct type for setTagToDelete
                                // setDeleteDialogOpen(true); // This state variable is not defined in the original code
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Detail indicator */}
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-background bg-muted animate-pulse"
                            />
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] font-black uppercase tracking-[0.2em] group/btn"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {userTags.length === 0 && (
                  <div className="col-span-full py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-xs uppercase tracking-widest font-semibold opacity-50">
                      No custom tags yet
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* System Tags Section */}
            {systemTags.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8 opacity-70">
                  <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      System Tags
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                      Automated organization
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {systemTags.map((tag) => (
                    <Card
                      key={tag.id}
                      className="border-none bg-muted/20 hover:bg-muted/30 transition-all cursor-default"
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full bg-muted-foreground/30 ring-2 ring-muted" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {tag.tagName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {tag.imageCount} items
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold tracking-widest uppercase opacity-40"
                        >
                          System
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        open={tagToDelete !== null}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent className="rounded-[32px] border-white/5 bg-zinc-950/90 backdrop-blur-2xl p-8 max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-widest text-destructive">
              Delete Label?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm leading-relaxed mt-2">
              Managing labels is an atomic operation. Deleting this label will
              remove it from all associated images across your library. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 flex-1 font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 rounded-2xl h-12 flex-1 font-bold shadow-xl shadow-destructive/20"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
