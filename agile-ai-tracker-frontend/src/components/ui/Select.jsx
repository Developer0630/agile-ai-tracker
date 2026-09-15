export default function Select({ label, error, className = '', id, children, ...props }) {
  const selectId = id || label?.toLowerCase?.().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[#44546F]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full h-8 px-2 text-sm text-[#172B4D] bg-white border rounded-[3px] focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] disabled:bg-[#F4F5F7] ${
          error ? 'border-[#DE350B]' : 'border-[#DFE1E6]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#DE350B]">{error}</p>}
    </div>
  );
}
