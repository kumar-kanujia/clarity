import { motion } from "motion/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/ui/components/app-sidebar";
import { PanelView } from "@/features/ui/components/panel-view";
import { User, Users, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PeoplePage() {
  const faces = [
    { name: "Unnamed Alpha", count: 42, color: "bg-red-500" },
    { name: "Group B", count: 12, color: "bg-green-500" },
    { name: "John Doe", count: 156, color: "bg-blue-500" },
    { name: "Sarah Smith", count: 89, color: "bg-yellow-500" },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans">
        <AppSidebar />
        <PanelView />
        <main className="flex-1 overflow-y-auto bg-black/40 p-12">
          <header className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
                Biometric Core
              </h2>
              <h1 className="text-5xl font-extrabold tracking-tighter">
                Recognized Faces
              </h1>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search persons..."
                className="h-12 pl-12 rounded-2xl bg-white/5 border-white/10 text-sm focus-visible:ring-primary/40"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {faces.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative aspect-[3/4] rounded-[2.5rem] bg-zinc-900 border border-white/5 p-8 flex flex-col justify-end overflow-hidden cursor-pointer shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute top-8 left-8 w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center bg-white/5 backdrop-blur-3xl">
                  <User className="w-8 h-8 text-zinc-500 group-hover:text-primary transition-colors" />
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="text-2xl font-black">{person.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                      {person.count} appearances
                    </span>
                  </div>
                </div>

                <div className="absolute top-8 right-8">
                  <MoreHorizontal className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}

            <motion.div
              whileHover={{ scale: 0.98 }}
              className="aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-zinc-400 hover:border-white/10 transition-all cursor-pointer"
            >
              <Users className="w-12 h-12" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Discover More Faces
              </span>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
