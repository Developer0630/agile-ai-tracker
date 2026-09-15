const variants = {
  primary: 'bg-[#0052CC] text-white border border-[#0052CC] hover:bg-[#0065FF] hover:border-[#0065FF] disabled:bg-[#091E42]/20 disabled:border-transparent disabled:text-[#091E42]/40',
  secondary: 'bg-white text-[#172B4D] border border-[#DFE1E6] hover:bg-[#F4F5F7] disabled:text-[#8993A4]',
  subtle: 'bg-transparent text-[#42526E] border border-transparent hover:bg-[#F4F5F7] disabled:text-[#8993A4]',
  danger: 'bg-[#DE350B] text-white border border-[#DE350B] hover:bg-[#BF2600] hover:border-[#BF2600] disabled:opacity-50',
};

const sizes = {
  sm: 'h-7 px-2 text-xs gap-1',
  md: 'h-8 px-3 text-sm gap-1.5',
  lg: 'h-9 px-4 text-sm gap-2',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-medium rounded-[3px] transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#4C9AFF] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
