import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useApp } from '@/utils/AppContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, fullName || email.split('@')[0]);
        showToast({ type: 'success', title: 'Cuenta creada', message: 'Revisa tu correo si Supabase requiere confirmación.' });
      } else {
        await login(email, password);
        showToast({ type: 'success', title: 'Sesión iniciada' });
      }
      navigate('/perfil');
    } catch (error) {
      showToast({ type: 'error', title: 'No se pudo acceder', message: error instanceof Error ? error.message : 'Verifica tus credenciales.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell page-pad">
      <div className="container" style={{ maxWidth: 480 }}>
        <form className="card card-pad grid gap-4" onSubmit={handleSubmit}>
          <div>
            <span className="section-kicker">Supabase Auth</span>
            <h1 className="section-title">{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
            <p className="muted">Esta pantalla ya usa la autenticación real de Supabase de la web antigua.</p>
          </div>

          {!isSupabaseConfigured ? <p className="badge badge-danger">Supabase no está configurado.</p> : null}

          {mode === 'register' ? <Input label="Nombre" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" /> : null}
          <Input label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" required />
          <Input label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required minLength={6} />
          <Button type="submit" loading={loading}>{mode === 'login' ? 'Entrar' : 'Registrarme'}</Button>
          <button className="btn btn-ghost" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
