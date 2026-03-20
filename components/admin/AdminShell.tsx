"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#0A0A0A]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:ml-64 lg:px-14 lg:py-12">
        <Topbar onMenuClick={() => setIsSidebarOpen((v) => !v)} />
        {children}
      </main>
    </div>
  );
}
