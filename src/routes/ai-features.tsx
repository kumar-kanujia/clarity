import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Sparkles, Wand2, Target, Eye } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/ai-features" as any)({
  component: AIFeaturesPage,
});

function AIFeaturesPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">
              Neural Hub
            </h1>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
            Advanced Vision Intelligence
          </p>
        </div>
        <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-bold px-8 h-10 gap-2">
          <Wand2 className="w-4 h-4" />
          Sync Library
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-400 font-bold tracking-widest uppercase text-[9px]"
              >
                Active Engine: GPT-4o Vision
              </Badge>
              <h2 className="text-5xl font-extrabold text-white tracking-tighter leading-[1.1]">
                Everything in your library,{" "}
                <span className="text-primary italic">understood.</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Clarity uses on-device neural processing to categorize your
                images by content, emotion, and technical quality.
              </p>
            </div>
            <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group cursor-none">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80"
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 to-transparent" />
              <motion.div
                animate={{
                  x: [100, 300, 200, 100],
                  y: [50, 150, 100, 50],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute w-32 h-32 border border-primary/50 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              >
                <Target className="w-6 h-6 text-white" />
                <span className="absolute -top-6 left-0 text-[9px] font-black uppercase text-primary">
                  Nebula Core
                </span>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Object Detection",
                icon: Eye,
                count: "12,431",
                color: "blue",
              },
              {
                title: "Facial Recognition",
                icon: Target,
                count: "842",
                color: "emerald",
              },
              {
                title: "Sentiment Analysis",
                icon: BrainCircuit,
                count: "98%",
                color: "amber",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="bg-zinc-900/40 border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden group hover:border-primary/20 transition-all duration-500"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-6`}
                  >
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-black text-white/90 tracking-tighter">
                    {stat.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
