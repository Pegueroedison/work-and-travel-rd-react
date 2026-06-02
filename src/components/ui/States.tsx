import { useEffect, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { useTheme } from '@/hooks/useTheme';
import type { ToastItem, User } from '@/types';

interface EmptyStateProps { icon?: string; title: string; description?: string; action?: { label: string; onClick: () => void }; }
export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return <div className="empty-state"><div className="empty-state__icon">{icon}</div><div className="empty-state__title">{title}</div>{description ? <p className="empty-state__desc">{description}</p> : null}{action ? <Button variant="primary" size="sm" onClick={action.onClick}>{action.label}</Button> : null}</div>;
}

export function LoadingState({ text = 'Cargando...' }: { text?: string }) {
  return <div className="loading-state"><div className="spinner" /><p>{text}</p></div>;
}

interface ErrorStateProps { title?: string; description?: string; onRetry?: () => void; }
export function ErrorState({ title = 'Algo salió mal', description = 'No pudimos cargar este contenido.', onRetry }: ErrorStateProps) {
  return <div className="empty-state"><div className="empty-state__icon">⚠️</div><div className="empty-state__title">{title}</div><p className="empty-state__desc">{description}</p>{onRetry ? <Button variant="ghost" size="sm" onClick={onRetry}>Reintentar</Button> : null}</div>;
}

interface ProgressBarProps { value: number; max?: number; label?: string; }
export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return <div>{label ? <div className="progress-label"><span>{label}</span><span>{Math.round(pct)}%</span></div> : null}<div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} /></div></div>;
}

interface FilePreviewProps { name: string; size?: string; type?: 'image' | 'pdf' | 'other'; onRemove?: () => void; }
export function FilePreview({ name, size, type = 'other', onRemove }: FilePreviewProps) {
  const icon = type === 'image' ? '🖼️' : type === 'pdf' ? '📄' : '📁';
  return <div className="file-preview"><span className="file-preview__icon">{icon}</span><div className="file-preview__info"><div className="file-preview__name">{name}</div>{size ? <div className="file-preview__size">{size}</div> : null}</div>{onRemove ? <button className="btn btn-ghost btn-icon btn-sm" onClick={onRemove} aria-label="Eliminar archivo" type="button"><CloseIcon size={16} /></button> : null}</div>;
}

interface ToastContainerProps { toasts: ToastItem[]; onDismiss: (id: string) => void; }
const toastIcons: Record<ToastItem['type'], string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  useEffect(() => {
    if (!toasts.length) return undefined;
    const timers = toasts.map((toast) => window.setTimeout(() => onDismiss(toast.id), 4500));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, onDismiss]);
  return <div className="toast-root" aria-live="polite" aria-label="Notificaciones">{toasts.map((toast) => <div key={toast.id} className={`toast ${toast.type}`} role="alert"><span>{toastIcons[toast.type]}</span><div className="toast-body"><strong className="toast-title">{toast.title}</strong>{toast.message ? <p className="toast-message">{toast.message}</p> : null}</div><button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Cerrar">✕</button></div>)}</div>;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return <button className={`btn btn-ghost btn-icon ${className}`.trim()} onClick={toggle} aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>;
}

interface UserRowProps { user: User; actions?: ReactNode; subtitle?: string; onClick?: () => void; }
export function UserRow({ user, actions, subtitle, onClick }: UserRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); }
  };
  return <div className={`user-row ${onClick ? 'clickable' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={handleKeyDown}><Avatar user={user} size="md" /><div className="user-row__info"><div className="user-row__name">{user.displayName}</div><div className="user-row__username">{subtitle || `@${user.username}`}</div></div>{actions ? <div className="user-row__actions">{actions}</div> : null}</div>;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return <div className="card skeleton-card"><div className="skeleton skeleton-title" />{Array.from({ length: lines }).map((_, index) => <div key={index} className={`skeleton skeleton-line ${index === lines - 1 ? 'short' : ''}`} />)}</div>;
}

function CloseIcon({ size = 20 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>; }
function SunIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>; }
function MoonIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>; }
