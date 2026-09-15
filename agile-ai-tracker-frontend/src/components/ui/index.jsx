
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Textarea } from './Textarea';
export { default as Badge } from './Badge';
export { default as StatusBadge } from './StatusBadge';
export { default as PriorityBadge } from './PriorityBadge';
export { default as Panel } from './Panel';
export { default as Modal, ModalFooter } from './Modal';
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as Avatar } from './Avatar';
export { default as PageHeader } from './PageHeader';
export function Button({ children, className = '', variant = 'default', size = 'md', ...props }) {
  const classes = ['fjra-button', `fjra-button--${variant}`, `fjra-button--${size}`, className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, children, className = '', ariaLabel, ...props }) {
  const classes = ['fjra-icon-button', className].filter(Boolean).join(' ');

  return (
    <button className={classes} aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)} {...props}>
      {Icon ? <Icon className="fjra-icon-button__icon" aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export function SegmentGroup({ value, onChange, options = [], className = '', ariaLabel }) {
  return (
    <div 
      className={['fjra-segment-group', className].filter(Boolean).join(' ')} 
      role="group" 
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={['fjra-segment-item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
            aria-pressed={isActive}
            // SỬA TẠI ĐÂY: Bắt buộc truyền option.value vào onChange
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) {
                onChange(option.value);
              }
            }}
          >
            {Icon ? <Icon className="fjra-segment-item__icon" aria-hidden="true" /> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SidebarNavButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['fjra-sidebar-nav', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
      aria-pressed={isActive}
    >
      {Icon ? <Icon className="fjra-sidebar-nav__icon" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}

export function WorkspaceTabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['fjra-workspace-tab', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon ? <Icon className="fjra-workspace-tab__icon" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}

export { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from './Table';
