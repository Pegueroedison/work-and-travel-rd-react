import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ForumCategory } from '@/types';
import { Button, FilePreview, Input, ProgressBar, Select, Textarea } from '@/components/ui';
import { createForumPost, listForumCategories } from '@/services/supabaseApi';
import { useApp } from '@/utils/AppContext';

export function CreatePostPage() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void listForumCategories().then((items) => {
      setCategories(items);
      setCategoryId(items[0]?.id || '');
    });
  }, []);

  const progress = Math.min(100, (title ? 30 : 0) + (content ? 45 : 0) + (categoryId ? 25 : 0));
  const categoryOptions = categories.map((category) => ({ value: category.id, label: `${category.icon} ${category.name}` }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      showToast({ type: 'warning', title: 'Inicia sesión', message: 'Debes entrar para publicar en el foro.' });
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const postId = await createForumPost({ title, content, categoryId });
      showToast({ type: 'success', title: 'Publicación enviada', message: 'Quedará visible cuando sea aprobada por moderación.' });
      navigate(`/foro/${postId}`);
    } catch (error) {
      showToast({ type: 'error', title: 'No se pudo publicar', message: error instanceof Error ? error.message : 'Revisa los campos e intenta otra vez.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell page-pad">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="section-head"><div><span className="section-kicker">Foro</span><h1 className="section-title">Crear publicación</h1><p className="muted">Conectado a `forum_posts` en Supabase. Los adjuntos quedan preparados para la próxima fase de uploads.</p></div></div>
        <form className="card card-pad grid gap-4" onSubmit={handleSubmit}>
          <Input label="Título" value={title} placeholder="Escribe una pregunta clara" onChange={(event) => setTitle(event.target.value)} required minLength={6} />
          <Textarea label="Contenido" value={content} placeholder="Comparte detalles, contexto o tu experiencia" onChange={(event) => setContent(event.target.value)} required minLength={10} />
          <Select label="Categoría" value={categoryId} options={categoryOptions} onChange={(event) => setCategoryId(event.target.value)} />
          <div className="grid gap-3"><label className="form-label">Adjuntos</label><FilePreview name="uploads pendientes de fase 2" size="Imagen/PDF preparados visualmente" type="other" /></div>
          <ProgressBar value={progress} label="Progreso" />
          <div className="modal-footer" style={{ padding: 0, borderTop: 0 }}><Link to="/foro" className="btn btn-ghost">Cancelar</Link><Button type="submit" loading={loading}>Publicar</Button></div>
        </form>
      </div>
    </div>
  );
}
