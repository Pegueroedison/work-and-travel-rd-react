import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, Button, LoadingState } from '@/components/ui';
import type { Notification } from '@/types';
import { formatRelative } from '@/utils/format';
import { listNotifications, markNotificationRead } from '@/services/supabaseApi';
import { useApp } from '@/utils/AppContext';

export function NotificationsPage() {
  const { showToast } = useApp();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listNotifications().then((data) => active && setItems(data)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const unread = items.filter((item) => !item.isRead).length;

  async function handleRead(id: string) {
    await markNotificationRead(id);
    setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  }

  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando notificaciones..." /></div>;

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 780 }}><div className="section-head"><div><span className="section-kicker">Centro</span><h1 className="section-title">Notificaciones</h1><p className="muted">Leídas/no leídas conectadas a Supabase.</p></div><Badge variant="secondary">{unread} nuevas</Badge></div><div className="card"><div className="card-pad post-head"><div><h2>Push notifications</h2><p className="muted text-small">La UI está lista; el alta real de push queda enlazada a las funciones existentes en otra fase.</p></div><Button onClick={() => showToast({ type: 'info', title: 'Push preparado', message: 'Se conectará al Edge Function existente cuando actives permisos.' })}>Activar push</Button></div>{items.map((notification) => {
    const content = <article className={`notification-item ${notification.isRead ? '' : 'unread'}`} onClick={() => void handleRead(notification.id)}>{notification.fromUser ? <Avatar user={notification.fromUser} size="sm" /> : <span className="avatar avatar-sm">🔔</span>}<div><div className="post-meta"><strong>{notification.title}</strong>{!notification.isRead ? <Badge>Nueva</Badge> : null}</div><p className="muted text-small">{notification.body}</p><p className="muted text-xs">{formatRelative(notification.createdAt)}</p></div></article>;
    return notification.link ? <Link key={notification.id} to={notification.link}>{content}</Link> : <div key={notification.id}>{content}</div>;
  })}</div></div></div>;
}
