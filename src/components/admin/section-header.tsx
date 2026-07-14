import AdminBreadcrumb from "./admin-breadcrumb";

interface Crumb {
  label: string;
  href?: string;
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

export default function SectionHeader({ title, description, breadcrumbs, actions }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && <AdminBreadcrumb items={breadcrumbs} />}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-foreground-secondary">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
