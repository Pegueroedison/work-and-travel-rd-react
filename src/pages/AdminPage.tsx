import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AdminStats } from '@/types';
import { Badge, Button, LoadingState, ThemeToggle } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { getAdminStats } from '@/services/supabaseApi';
import { useApp } from '@/utils/AppContext';

const modules = [
  ['👥','Usuarios','Gestión de usuarios, roles y estados'], ['🛡️','Roles y permisos','Permisos de admin, moderador y usuarios'], ['🚩','Moderación','Reportes, publicaciones y comentarios'], ['💬','Foro','Categorías, publicaciones fijadas y reglas'], ['🎞️','Slides','Carrusel administrable de inicio'], ['📢','Avisos','Anuncios importantes y push'], ['🧱','Bloques','Bloques informativos de la home'], ['📝','Blogs','Artículos, categorías y borradores'], ['🎙️','Práctica','Preguntas, salas y programación'], ['🌎','Países','Selector y catálogos'], ['🎨','Branding','Logo, favicon, PWA e imágenes'], ['📏','Límites','Tamaños de archivo y uso'], ['🔔','Notificaciones','Plantillas y campañas']
] as const;

export function AdminPage() {
  const [active, setActive] = useState('Usuarios');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const { currentUser } = useApp();
  const canOpen = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'moderator';

  useEffect(() => { void getAdminStats().then(setStats); }, []);

  if (!stats) return <div className="page-shell page-pad"><LoadingState text="Cargando estadísticas admin..." /></div>;

  return <div className="admin-shell"><aside className="admin-sidebar"><Link to="/" className="brand"><div className="brand__logo">W</div><span className="brand__name">Admin WATRD</span></Link><div className="divider" />{!canOpen ? <Badge variant="warning">Vista protegida por RLS</Badge> : null}<div className="admin-nav-group"><div className="admin-nav-group-title">Módulos</div>{modules.map(([icon, name]) => <button key={name} className={`admin-nav-btn ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}>{icon} {name}</button>)}</div></aside><main className="admin-content"><div className="admin-header"><div><span className="section-kicker">Panel administrativo</span><h1 className="section-title">{active}</h1><p className="muted">Módulos visuales conectados a estadísticas reales disponibles por RLS.</p></div><div className="header-actions"><ThemeToggle /><Link to="/" className="btn btn-ghost">Ver app</Link></div></div><div className="stats-grid" style={{ marginBottom: 16 }}><Stat value={stats.totalUsers} label="Usuarios" /><Stat value={stats.activeUsers} label="Activos" /><Stat value={stats.totalPosts} label="Posts" /><Stat value={stats.pendingReports} label="Reportes" /></div><section className="admin-grid">{modules.map(([icon, name, desc]) => <article key={name} className="card admin-module"><div className="admin-module__icon">{icon}</div><div className="post-meta"><h2 className="admin-module__title">{name}</h2>{active === name ? <Badge>Activo</Badge> : null}</div><p className="muted text-small">{desc}</p><Button variant={active === name ? 'primary' : 'ghost'} size="sm" onClick={() => setActive(name)}>Configurar</Button></article>)}</section></main></div>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="card stat-card"><div className="stat-value">{formatNumber(value)}</div><div className="stat-label">{label}</div></div>; }
