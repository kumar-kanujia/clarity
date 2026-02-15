import { motion } from "motion/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/ui/components/app-sidebar";
import { PanelView } from "@/features/ui/components/panel-view";
import { Shield, Lock, Fingerprint, Eye, WifiOff } from "lucide-react";

export default function VaultPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans">
        <AppSidebar />
        <PanelView />
        <main className="flex-1 overflow-y-auto bg-black/40 p-12 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full">
            <header className="text-center mb-16 space-y-4">
              <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6">
                <Shield className="w-10 h-10" />
              </div>
              <h1 className="text-6xl font-black tracking-tighter">
                Liquid Vault
              </h1>
              <p className="text-zinc-500 font-medium text-lg">
                Military-grade on-device encryption for your sensitive vision.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Fingerprint,
                  title: "Biometric",
                  desc: "TouchID Integrated",
                },
                { icon: Lock, title: "AES-256", desc: "Standard Encryption" },
                { icon: WifiOff, title: "Air-Gapped", desc: "No Cloud Sync" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <item.icon className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-between group cursor-pointer hover:bg-primary/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-primary">
                    Open Secure Corridor
                  </h3>
                  <p className="text-xs text-primary/60 font-bold uppercase tracking-widest">
                    Requires Fingerprint Authentication
                  </p>
                </div>
              </div>
              <Eye className="w-6 h-6 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>

            <footer className="mt-16 pt-8 border-t border-white/5 flex justify-center gap-12 text-zinc-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500/40" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Encrypted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Corridor Locked
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
