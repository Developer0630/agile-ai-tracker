import React from 'react';

export function SegmentGroup({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 ${className}`}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentGroup;