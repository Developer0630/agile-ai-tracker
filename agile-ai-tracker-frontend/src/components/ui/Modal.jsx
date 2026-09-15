import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, description, footer, children, size = 'md' }) {
  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#091E42]/50" onClick={onClose}>
      <div
        className={`bg-white border border-[#DFE1E6] rounded-[3px] w-full ${widths[size]} shadow-sm`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#DFE1E6]">
          <div>
            <h2 id="modal-title" className="text-sm font-semibold text-[#172B4D]">{title}</h2>
            {description && <p className="text-xs text-[#626F86] mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[#626F86] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded-[3px] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, cancelLabel = 'Cancel', submitLabel, onSubmit, loading, submitVariant = 'primary' }) {
  return (
    <>
      <Button variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
      <Button variant={submitVariant} size="sm" onClick={onSubmit} disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </>
  );
}
