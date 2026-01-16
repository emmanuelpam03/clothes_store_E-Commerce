import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // block access to non-admin users
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
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
