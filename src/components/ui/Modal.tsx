import { useEffect, type ReactNode } from 'react';

interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg'; }
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <div className={`modal-card ${size !== 'md' ? `modal-card--${size}` : ''}`.trim()} role="dialog" aria-modal="true" aria-label={title || 'Modal'}>
        {title ? <div className="modal-head"><h2>{title}</h2><button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button></div> : null}
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

interface BottomSheetProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; }
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <>
      <button className="sheet-backdrop" onClick={onClose} aria-label="Cerrar panel" />
      <div className="sheet-card" role="dialog" aria-modal="true" aria-label={title || 'Panel'}>
        <div className="sheet-handle" />
        {title ? <div className="sheet-head"><h3 className="sheet-title">{title}</h3><button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Cerrar"><CloseIcon /></button></div> : null}
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
}
