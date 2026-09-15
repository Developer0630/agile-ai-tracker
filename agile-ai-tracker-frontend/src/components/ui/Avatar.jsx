export default function Avatar({ name, size = 'md', className = '' }) {
  const initial = (name?.charAt?.(0) || '?').toUpperCase();
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-7 h-7 text-xs', lg: 'w-8 h-8 text-sm' };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-[#DEEBFF] text-[#0052CC] font-semibold flex items-center justify-center shrink-0 ${className}`}
      title={name}
    >
      {initial}
    </div>
  );
}
