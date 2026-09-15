export default function Panel({ title, description, actions, className = '', children, noPadding = false }) {
  return (
    <section className={`bg-white border border-[#DFE1E6] rounded-[3px] ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#DFE1E6]">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#172B4D]">{title}</h3>}
            {description && <p className="text-xs text-[#626F86] mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </section>
  );
}
