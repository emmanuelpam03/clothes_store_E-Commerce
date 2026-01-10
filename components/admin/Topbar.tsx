"use client";

import { Bell, User, Search, Menu } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden">
          <Menu size={20} className="text-slate-600" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-4 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative hover:bg-slate-100 p-2 rounded-lg transition">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="flex items-center gap-3 hover:bg-slate-100 px-3 py-2 rounded-lg transition">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">Admin</span>
        </button>
      </div>
    </header>
  );
}
