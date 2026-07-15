import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 min-h-0">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
