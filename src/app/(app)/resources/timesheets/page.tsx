"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Send } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
import { TimesheetTable } from "@/components/resources/timesheet-table";
import { TimesheetApprovalTable } from "@/components/resources/timesheet-approval-table";
import { TimeEntryDialog } from "@/components/resources/time-entry-dialog";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { useTimesheet, useTimeEntryActions, useTimesheetActions } from "@/hooks/use-resources";

export default function TimesheetsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [view, setView] = useState<"my" | "approvals">("my");

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const weekStart = monday.toISOString().split("T")[0];

  const { data: myTimesheets, loading, refetch } = useTimesheet(session?.user?.id, weekStart);
  const { data: allTimesheets, loading: allLoading, refetch: refetchAll } = useTimesheet(undefined, weekStart);
  const { create, loading: entryLoading } = useTimeEntryActions();
  const { submit, approve, reject, loading: actionLoading } = useTimesheetActions();

  const handleCreateEntry = useCallback(async (data: { taskId: string; description?: string; timeSpent: number; billable: boolean; loggedAt: string }) => {
    await create(data);
    setIsEntryOpen(false);
    refetch();
    refetchAll();
  }, [create, refetch, refetchAll]);

  const handleSubmit = useCallback(async (id: string) => {
    await submit(id);
    refetch();
    refetchAll();
  }, [submit, refetch, refetchAll]);

  const handleApprove = useCallback(async (id: string) => {
    await approve(id);
    refetchAll();
  }, [approve, refetchAll]);

  const handleReject = useCallback(async (id: string) => {
    const reason = window.prompt("Rejection reason:");
    if (!reason) return;
    await reject(id, reason);
    refetchAll();
  }, [reject, refetchAll]);

  const pendingApprovals = (allTimesheets || []).filter((ts) => ts.status === "SUBMITTED");
  const approvalData = pendingApprovals.map((ts) => ({
    id: ts.id,
    timesheetId: ts.id,
    userId: ts.userId,
    userName: ts.userName,
    userEmail: ts.userEmail,
    weekStart: ts.weekStart,
    weekEnd: ts.weekEnd,
    status: ts.status,
    totalHours: ts.totalHours,
    submittedAt: ts.submittedAt || "",
  }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Timesheets"
        subtitle="Track weekly time entries and manage approvals."
        actions={
          <Button variant="gradient" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsEntryOpen(true)}>
            Log Time
          </Button>
        }
      />

      {isAdmin && (
        <div className="flex gap-4 border-b border-border mb-6 pb-3">
          <button
            onClick={() => setView("my")}
            className={`text-sm font-medium transition-colors ${view === "my" ? "text-accent" : "text-foreground-secondary hover:text-foreground"}`}
          >
            My Timesheet
          </button>
          <button
            onClick={() => setView("approvals")}
            className={`text-sm font-medium transition-colors ${view === "approvals" ? "text-accent" : "text-foreground-secondary hover:text-foreground"}`}
          >
            Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {loading || allLoading ? (
          <AnalyticsSkeleton />
        ) : view === "my" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-secondary">Week of {weekStart}</p>
              {myTimesheets.filter((ts) => ts.status === "DRAFT").length > 0 && (
                                <Button variant="outline" size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={() => handleSubmit(myTimesheets.find((ts) => ts.status === "DRAFT")!.id)} isLoading={actionLoading}>
                  Submit for Approval
                </Button>
              )}
            </div>
            <TimesheetTable data={myTimesheets} />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-foreground-secondary">Pending approvals for week of {weekStart}</p>
            <TimesheetApprovalTable data={approvalData} onApprove={handleApprove} onReject={handleReject} />
          </div>
        )}
      </div>

      <TimeEntryDialog
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        onSubmit={handleCreateEntry}
        loading={entryLoading}
      />
    </main>
  );
}
