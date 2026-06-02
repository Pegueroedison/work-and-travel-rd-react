import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_COUNTRIES, MOCK_ME, MOCK_USERS } from '@/mocks';
import { useApp } from '@/utils/AppContext';
import { Avatar, Badge, BottomSheet, Button, Input, LoadingState, Textarea, UserRow } from '@/components/ui';
import type { User } from '@/types';
import { getPublicProfileByUsername } from '@/services/supabaseApi';

export function MyProfilePage() {
  const navigate = useNavigate();
  const { currentUser, authLoading, saveProfile, showToast } = useApp();
  const user = currentUser || MOCK_ME;
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [country, setCountry] = useState(user.country || 'DO');
  const [sponsor, setSponsor] = useState(user.sponsor || '');
  const [year, setYear] = useState(user.year ? String(user.year) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName);
    setUsername(user.username);
    setBio(user.bio || '');
    setCountry(user.country || 'DO');
    setSponsor(user.sponsor || '');
    setYear(user.year ? String(user.year) : '');
  }, [user.bio, user.country, user.displayName, user.sponsor, user.username, user.year]);

  const countries = MOCK_COUNTRIES.filter((item) => item.name.toLowerCase().includes(countryQuery.toLowerCase()));
  const countryLabel = MOCK_COUNTRIES.find((item) => item.code === country || item.name === country);

  async function handleSave() {
    if (!currentUser) {
      showToast({ type: 'warning', title: 'Inicia sesión', message: 'Debes entrar para guardar tu perfil.' });
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ displayName, username, bio, country, sponsor, year: Number.parseInt(year, 10) || undefined });
      showToast({ type: 'success', title: 'Perfil guardado', message: 'Tus datos se sincronizaron con Supabase.' });
    } catch (error) {
      showToast({ type: 'error', title: 'No se pudo guardar', message: error instanceof Error ? error.message : 'Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <div className="page-shell page-pad"><LoadingState text="Cargando perfil..." /></div>;

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 860 }}><section className="card profile-hero"><div className="profile-top"><Avatar user={{ ...user, displayName, avatar: user.avatar }} size="2xl" /><div className="profile-info"><Badge variant="info">Mi perfil</Badge><h1 className="section-title">{displayName}</h1><p className="muted">@{username}</p><p>{bio}</p></div><Button onClick={handleSave} loading={saving}>Guardar cambios</Button></div><div className="stats-grid"><Stat value={user.friendCount} label="Amigos" /><Stat value={user.postCount} label="Publicaciones" /><Stat value={year || '—'} label="Año" /></div></section><section className="card card-pad grid gap-4" style={{ marginTop: 16 }}><Input label="Nombre" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /><Input label="Username" value={username} onChange={(event) => setUsername(event.target.value)} /><Textarea label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} /><button type="button" className="input" onClick={() => setCountryOpen(true)} style={{ textAlign: 'left' }}>País: {countryLabel?.flag || '🌎'} {countryLabel?.name || country || 'Seleccionar'}</button><Input label="Sponsor" value={sponsor} onChange={(event) => setSponsor(event.target.value)} /><Input label="Año" value={year} onChange={(event) => setYear(event.target.value)} /></section><BottomSheet isOpen={countryOpen} onClose={() => setCountryOpen(false)} title="Selecciona tu país"><Input placeholder="Buscar país..." value={countryQuery} onChange={(event) => setCountryQuery(event.target.value)} autoFocus /><div style={{ marginTop: 12 }}>{countries.map((item) => <button key={item.code} className="country-row" onClick={() => { setCountry(item.name); setCountryOpen(false); }}><span>{item.flag} {item.name}</span><span className="muted">{item.code}</span></button>)}</div></BottomSheet></div></div>;
}

export function PublicProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!username) return undefined;
    getPublicProfileByUsername(username)
      .then((profile) => active && setUser(profile || MOCK_USERS.find((item) => item.username === username) || MOCK_USERS[0]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [username]);

  const resolvedUser = useMemo(() => user || MOCK_USERS[0], [user]);
  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando perfil público..." /></div>;

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 860 }}><section className="card profile-hero"><div className="profile-top"><Avatar user={resolvedUser} size="2xl" /><div className="profile-info"><Badge variant={resolvedUser.role === 'admin' ? 'warning' : 'neutral'}>{resolvedUser.role}</Badge><h1 className="section-title">{resolvedUser.displayName}</h1><p className="muted">@{resolvedUser.username}</p><p>{resolvedUser.bio}</p><p className="muted text-small">País {resolvedUser.country || '—'} · Sponsor {resolvedUser.sponsor || '—'} · Año {resolvedUser.year || '—'}</p></div><div className="hero-actions"><Button>Agregar amigo</Button><Button variant="ghost">Mensaje</Button><Button variant="soft" onClick={() => history.back()}>Cerrar</Button></div></div><div className="stats-grid"><Stat value={resolvedUser.friendCount} label="Amigos" /><Stat value={resolvedUser.postCount} label="Publicaciones" /><Stat value={resolvedUser.year || '—'} label="Año" /></div></section><section className="card card-pad" style={{ marginTop: 16 }}><h2>Actividad reciente</h2><UserRow user={resolvedUser} subtitle="Perfil público conectado a public_profiles" /></section></div></div>;
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return <div className="card stat-card"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>;
}
