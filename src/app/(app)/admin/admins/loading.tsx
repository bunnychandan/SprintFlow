import { ListSkeleton } from "@/components/ui";

export default function AdminsLoading() {
  return (
    <div className="p-6">
      <ListSkeleton rows={5} />
    </div>
  );
}
