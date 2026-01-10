"use client";

import { Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="font-semibold text-lg">Admin Dashboard</h2>

      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <User size={20} />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
