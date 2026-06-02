import { useCallback, useState } from 'react';
import type { ToastItem } from '@/types';

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counter}`;
    setToasts((previous) => [...previous.slice(-4), { ...toast, id }]);
    return id;
  }, []);
  const dismiss = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);
  return { toasts, show, dismiss };
}
