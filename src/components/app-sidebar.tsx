import { Home, Inbox, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";

// Menu items.
const items = [
  {
    title: "Library",
    url: "/",
    icon: Home,
  },
  {
    title: "Scanner",
    url: "/old",
    icon: Inbox,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <SidebarContent className="bg-background/80 backdrop-blur-xl border-r border-white/5 pt-6 px-3">
        <SidebarGroup>
          <div className="px-4 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-lg bg-primary" />
            </div>
            <span className="font-black text-lg tracking-tight group-data-[collapsible=icon]:hidden">
              Clarity
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-12 rounded-2xl transition-all duration-300 font-medium ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                          : "hover:bg-white/5 hover:pl-4"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-muted-foreground"
                          }`}
                        />
                        <span className={isActive ? "text-white" : ""}>
                          {item.title}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-4 pb-8">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-12 rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors justify-center md:justify-start">
                <Settings className="w-5 h-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
