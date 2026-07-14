import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";
import SuperAdminDashboard from "./super-admin-dashboard";
import AdminDashboard from "./admin-dashboard";
import UserDashboard from "./user-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  if (user.role === "SUPER_ADMIN") {
    return <SuperAdminDashboard user={user} />;
  }

  if (isAdmin(user.role)) {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} />;
}
