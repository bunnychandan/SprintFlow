"use client";

import SearchBar from "./search-bar";

interface AdminToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex-1 min-w-[200px] max-w-sm">
        <SearchBar value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
    </div>
  );
}
