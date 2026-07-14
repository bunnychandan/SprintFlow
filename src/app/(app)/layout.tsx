import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex-1 pl-64 min-h-screen flex flex-col transition-all duration-200">
        <header className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-2">
          <NotificationBell />
        </header>
        <main id="main-content" className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
