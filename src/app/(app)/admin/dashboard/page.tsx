import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminStatsCards from "@/components/admin/admin-stats-cards";
import SectionHeader from "@/components/admin/section-header";
import { Users, Briefcase, ListChecks, Target } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [totalUsers, activeUsers, totalProjects, totalTasks, activeSprints] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.task.count({ where: { deletedAt: null } }),
    prisma.sprint.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div>
      <SectionHeader
        title="Admin Dashboard"
        description="Platform overview and quick stats"
        breadcrumbs={[{ label: "Dashboard" }]}
      />
      <AdminStatsCards
        stats={[
          { label: "Total Users", value: totalUsers, icon: <Users className="h-6 w-6" /> },
          { label: "Active Users", value: activeUsers, icon: <Users className="h-6 w-6" /> },
          { label: "Projects", value: totalProjects, icon: <Briefcase className="h-6 w-6" /> },
          { label: "Total Tasks", value: totalTasks, icon: <ListChecks className="h-6 w-6" /> },
          { label: "Active Sprints", value: activeSprints, icon: <Target className="h-6 w-6" /> },
        ]}
      />
    </div>
  );
}
