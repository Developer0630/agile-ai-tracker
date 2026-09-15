const tones = {
  neutral: 'bg-[#DFE1E6] text-[#44546F]',
  blue: 'bg-[#DEEBFF] text-[#0052CC]',
  green: 'bg-[#E3FCEF] text-[#006644]',
  yellow: 'bg-[#FFFAE6] text-[#974F0C]',
  red: 'bg-[#FFEBE6] text-[#AE2A19]',
  purple: 'bg-[#EAE6FF] text-[#403294]',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-[3px] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
