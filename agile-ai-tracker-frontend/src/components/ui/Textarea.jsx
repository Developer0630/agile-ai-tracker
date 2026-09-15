export default function Textarea({ label, error, className = '', id, ...props }) {
  const textareaId = id || label?.toLowerCase?.().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-[#44546F]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-2 py-1.5 text-sm text-[#172B4D] bg-white border rounded-[3px] placeholder:text-[#8993A4] focus:outline-none focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF] resize-y min-h-[72px] ${
          error ? 'border-[#DE350B]' : 'border-[#DFE1E6]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#DE350B]">{error}</p>}
    </div>
  );
}
