import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/utils/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle, ToastContainer } from '@/components/ui/States';

type NavItem = { path: string; label: string; icon: (active: boolean, avatar?: string, name?: string) => ReactNode };

const navItems: NavItem[] = [
  { path: '/', label: 'Inicio', icon: (active) => <HomeIcon filled={active} /> },
  { path: '/foro', label: 'Foro', icon: (active) => <ForumIcon filled={active} /> },
  { path: '/practica', label: 'Práctica', icon: (active) => <PracticeIcon filled={active} /> },
  { path: '/mensajes', label: 'Mensajes', icon: (active) => <MessagesIcon filled={active} /> },
  { path: '/perfil', label: 'Perfil', icon: (_active, avatar, name) => avatar ? <img className="bottom-avatar" src={avatar} alt={name || 'Perfil'} /> : <ProfileIcon /> }
];

const desktopNav = [
  { path: '/', label: 'Inicio' }, { path: '/foro', label: 'Foro' }, { path: '/blogs', label: 'Blogs' }, { path: '/practica', label: 'Práctica' }, { path: '/amigos', label: 'Amigos' }
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { currentUser, toggleTheme, theme, toasts, dismissToast, isLoggedIn } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const notifCount = 3;
  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  if (location.pathname.startsWith('/admin')) return <>{children}<ToastContainer toasts={toasts} onDismiss={dismissToast} /></>;
  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Work and Travel RD"><div className="brand__logo">W</div><span className="brand__name">Work &amp; Travel RD</span></Link>
        <nav className="desktop-nav" aria-label="Navegación principal">{desktopNav.map((item) => <Link key={item.path} to={item.path} className={isActive(item.path) ? 'active' : ''}>{item.label}</Link>)}</nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link to="/notificaciones" className="btn btn-ghost btn-icon notification-link" aria-label="Notificaciones"><BellIcon />{notifCount > 0 ? <span className="notification-count">{notifCount}</span> : null}</Link>
          {isLoggedIn && currentUser ? <Link to="/perfil" aria-label="Mi perfil"><Avatar user={currentUser} size="sm" /></Link> : <Link to="/login" className="btn btn-primary btn-sm">Ingresar</Link>}
          <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Menú" aria-expanded={mobileNavOpen}><MenuIcon /></button>
        </div>
      </header>
      {mobileNavOpen ? <><button className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Cerrar menú" /><nav className="mobile-nav-panel" aria-label="Menú móvil">{desktopNav.map((item) => <Link key={item.path} to={item.path} className={isActive(item.path) ? 'active' : ''} onClick={() => setMobileNavOpen(false)}>{item.label}</Link>)}<div className="divider" /><button onClick={() => { toggleTheme(); setMobileNavOpen(false); }}>{theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}</button>{currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? <Link to="/admin" onClick={() => setMobileNavOpen(false)} className="admin-entry">⚙️ Panel Admin</Link> : null}</nav></> : null}
      <main>{children}</main>
      <nav className="bottom-nav" aria-label="Navegación inferior"><div className="bottom-nav__items">{navItems.map((item) => { const active = isActive(item.path); const isProfile = item.path === '/perfil'; return <Link key={item.path} to={item.path} className={`bottom-nav__item ${active ? 'active' : ''}`} aria-label={item.label} aria-current={active ? 'page' : undefined}>{item.icon(active, isProfile ? currentUser?.avatar : undefined, isProfile ? currentUser?.displayName : undefined)}<span>{item.label}</span>{item.path === '/mensajes' && notifCount > 0 ? <span className="nav-dot" /> : null}</Link>; })}</div></nav>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function HomeIcon({ filled }: { filled: boolean }) { return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function ForumIcon({ filled }: { filled: boolean }) { return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>; }
function PracticeIcon({ filled }: { filled: boolean }) { return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>; }
function MessagesIcon({ filled }: { filled: boolean }) { return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>; }
function ProfileIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function BellIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
