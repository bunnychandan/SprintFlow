import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
