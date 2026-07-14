import { ListSkeleton } from "@/components/ui";

export default function AuditLoading() {
  return (
    <div className="p-6">
      <ListSkeleton rows={8} />
    </div>
  );
}
