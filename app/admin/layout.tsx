import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#0A0A0A] flex">
      <Sidebar />

      <main className="flex-1 px-14 py-12">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
