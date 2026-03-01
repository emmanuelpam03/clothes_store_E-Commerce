"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-900 to-slate-800 text-white px-6 py-8 flex flex-col overflow-y-auto">
      <div className="mb-12">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          AdminHub
        </h1>
        <p className="text-xs text-slate-400 mt-1 tracking-widest">
          MANAGEMENT
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        {links.map((l) => {
          const Icon = l.icon;
          // Special handling for dashboard root to avoid matching all /admin/* routes
          // For other routes, match exact path or sub-routes (with trailing slash)
          const isActive =
            l.href === "/admin"
              ? pathname === l.href
              : pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.name}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={`transition ${
                  isActive ? "text-white" : "group-hover:text-blue-400"
                }`}
              />
              <span className="text-sm font-medium">{l.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-500 px-4">v1.0.0</p>
      </div>
    </aside>
  );
}
