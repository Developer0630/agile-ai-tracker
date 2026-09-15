export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto border border-[#DFE1E6] rounded-[3px] ${className}`}>
      <table className="w-full text-sm text-left border-collapse">{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({ children, className = '' }) {
  return (
    <th className={`px-3 py-2 text-xs font-semibold text-[#44546F] whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody className="bg-white divide-y divide-[#DFE1E6]">{children}</tbody>;
}

export function TableRow({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[#F4F5F7] transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-3 py-2 text-sm text-[#172B4D] align-middle ${className}`}>
      {children}
    </td>
  );
}
