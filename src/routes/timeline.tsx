import { motion } from "motion/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/ui/components/app-sidebar";
import { PanelView } from "@/features/ui/components/panel-view";
import { Calendar, Clock, ChevronRight } from "lucide-react";

export default function TimelinePage() {
  const events = [
    {
      date: "Oct 2025",
      title: "Autumn Collection",
      count: 124,
      color: "bg-orange-500",
    },
    {
      date: "Aug 2025",
      title: "Summer Roadtrip",
      count: 450,
      color: "bg-blue-500",
    },
    {
      date: "May 2025",
      title: "Product Launch",
      count: 89,
      color: "bg-purple-500",
    },
    {
      date: "Jan 2025",
      title: "Winter Solstice",
      count: 231,
      color: "bg-zinc-500",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans">
        <AppSidebar />
        <PanelView />
        <main className="flex-1 overflow-y-auto bg-black/40 p-12">
          <header className="mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
              Chronology
            </h2>
            <h1 className="text-5xl font-extrabold tracking-tighter">
              Library Timeline
            </h1>
          </header>

          <div className="relative border-l border-white/10 ml-4 space-y-24">
            {events.map((event, i) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12"
              >
                <div
                  className={cn(
                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-zinc-950",
                    event.color,
                  )}
                />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      {event.date}
                    </span>
                  </div>

                  <div className="group cursor-pointer">
                    <h3 className="text-3xl font-black group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-zinc-400">
                        {event.count} items discovered
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="aspect-square rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
