export default function PageHeader({ title, description, breadcrumbs, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-[#DFE1E6] mb-4">
      <div>
        {breadcrumbs && (
          <nav className="text-xs text-[#626F86] mb-1" aria-label="Breadcrumb">
            {breadcrumbs}
          </nav>
        )}
        <h1 className="text-lg font-semibold text-[#172B4D]">{title}</h1>
        {description && <p className="text-xs text-[#626F86] mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
