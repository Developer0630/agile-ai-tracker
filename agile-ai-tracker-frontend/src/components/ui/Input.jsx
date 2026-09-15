export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase?.().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#44546F]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full h-8 px-2 text-sm text-[#172B4D] bg-white border rounded-[3px] placeholder:text-[#8993A4] focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] disabled:bg-[#F4F5F7] disabled:text-[#8993A4] ${
          error ? 'border-[#DE350B]' : 'border-[#DFE1E6]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#DE350B]">{error}</p>}
    </div>
  );
}
