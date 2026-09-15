import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon className="w-8 h-8 text-[#C1C7D0] mb-3" strokeWidth={1.5} />}
      <h3 className="text-sm font-medium text-[#172B4D]">{title}</h3>
      {description && <p className="text-xs text-[#626F86] mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
