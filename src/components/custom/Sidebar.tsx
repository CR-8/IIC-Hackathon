"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", badge: null },
  ];

  // const generalItems = [
  //   { icon: Settings, label: "Settings", href: "/settings" },
  //   { icon: HelpCircle, label: "Help", href: "/help" },
  //   { icon: LogOut, label: "Logout", href: "/logout" },
  // ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border/50 flex flex-col z-50">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-xl">L</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Lumi</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-4 mb-3 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 rounded-xl transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="h-5 px-2 text-xs rounded-full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Theme Toggle at Bottom */}
      <div className="p-6 border-t border-sidebar-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
