import { createFileRoute } from "@tanstack/react-router";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tags")({
  component: TagsPage,
});

function TagsPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
        <Tag className="w-10 h-10 text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Image Tags</h1>
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        Organize your library with smart tags. This feature is coming soon to
        help you categorize your collections.
      </p>
      <Button
        variant="outline"
        className="rounded-full bg-white/5 border-white/10 gap-2"
      >
        <Plus className="w-4 h-4" />
        Create your first tag
      </Button>
    </div>
  );
}
