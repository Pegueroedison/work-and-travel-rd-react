import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ForumCategory, ForumPost } from '@/types';
import { Avatar, Badge, Button, Chip, Input, LoadingState } from '@/components/ui';
import { formatRelative } from '@/utils/format';
import { listForumCategories, listForumPosts, reportPost, togglePostLike } from '@/services/supabaseApi';
import { useApp } from '@/utils/AppContext';

export function ForumPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useApp();

  useEffect(() => {
    let active = true;
    Promise.all([listForumCategories(), listForumPosts()])
      .then(([categoryData, postData]) => {
        if (!active) return;
        setCategories(categoryData);
        setPosts(postData);
      })
      .catch((error) => showToast({ type: 'error', title: 'No se pudo cargar el foro', message: error instanceof Error ? error.message : 'Error desconocido' }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [showToast]);

  const filtered = useMemo(() => posts.filter((post) => {
    const matchesCategory = categoryId === 'all' || post.category.id === categoryId;
    const text = `${post.title} ${post.content} ${post.author.displayName}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  }), [categoryId, posts, query]);

  async function handleLike(post: ForumPost) {
    try {
      const liked = await togglePostLike(post);
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, isLiked: liked, likeCount: item.likeCount + (liked ? 1 : -1) } : item));
    } catch (error) {
      showToast({ type: 'warning', title: 'Inicia sesión', message: error instanceof Error ? error.message : 'No se pudo registrar el like.' });
    }
  }

  async function handleReport(post: ForumPost) {
    try {
      await reportPost(post.id);
      showToast({ type: 'success', title: 'Reporte enviado', message: 'El equipo revisará esta publicación.' });
    } catch (error) {
      showToast({ type: 'warning', title: 'No se pudo reportar', message: error instanceof Error ? error.message : 'Intenta iniciar sesión.' });
    }
  }

  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando foro desde Supabase..." /></div>;

  return (
    <div className="page-shell page-pad">
      <div className="container forum-layout">
        <main className="grid gap-4">
          <div className="section-head"><div><span className="section-kicker">Comunidad</span><h1 className="section-title">Foro W&T RD</h1><p className="muted">Preguntas, experiencias, archivos y respuestas reales de Supabase.</p></div><Link to="/foro/crear" className="btn btn-primary">Crear publicación</Link></div>
          <Input placeholder="Buscar en el foro..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar" />
          <div className="filter-row"><Chip active={categoryId === 'all'} onClick={() => setCategoryId('all')}>Todos</Chip>{categories.map((category) => <Chip key={category.id} active={categoryId === category.id} onClick={() => setCategoryId(category.id)}>{category.icon} {category.name}</Chip>)}</div>
          <div className="grid gap-3">{filtered.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} onReport={handleReport} />)}</div>
        </main>
        <aside className="side-panel"><div className="card card-pad"><h2 className="text-small">Categorías</h2><div className="divider" />{categories.map((category) => <button key={category.id} className="country-row" onClick={() => setCategoryId(category.id)}><span>{category.icon} {category.name}</span><span className="badge badge-neutral">{posts.filter((post) => post.category.id === category.id).length}</span></button>)}</div><div className="card card-pad"><h2 className="text-small">Reglas rápidas</h2><p className="muted text-small">Sé respetuoso, no publiques datos sensibles y reporta contenido sospechoso.</p></div></aside>
      </div>
    </div>
  );
}

function PostCard({ post, onLike, onReport }: { post: ForumPost; onLike: (post: ForumPost) => void; onReport: (post: ForumPost) => void }) {
  return <article className="card post-card"><Link to={`/foro/${post.id}`}><div className="post-head"><Avatar user={post.author} size="md" /><div style={{ flex: 1, minWidth: 0 }}><div className="post-meta"><Badge>{post.category.icon} {post.category.name}</Badge>{post.isPinned ? <Badge variant="warning">📌 Fijado</Badge> : null}<span className="muted text-xs">@{post.author.username} · {formatRelative(post.createdAt)}</span></div><h2 className="post-title">{post.title}</h2><p className="post-content">{post.content}</p></div></div>{post.images?.[0] ? <div className="post-preview"><img src={post.images[0]} alt="Preview" /></div> : null}{post.pdfUrl ? <div className="file-preview"><span className="file-preview__icon">📄</span><div className="file-preview__info"><div className="file-preview__name">Documento adjunto PDF</div><div className="file-preview__size">Preview visual</div></div></div> : null}</Link><div className="post-actions"><Button variant="ghost" size="sm" onClick={() => onLike(post)}>{post.isLiked ? '❤️' : '🤍'} {post.likeCount}</Button><Link className="btn btn-ghost btn-sm" to={`/foro/${post.id}`}>💬 {post.commentCount}</Link><Button variant="ghost" size="sm">🔖 {post.isSaved ? 'Guardado' : 'Guardar'}</Button><Button variant="ghost" size="sm" onClick={() => onReport(post)}>🚩 Reportar</Button></div></article>;
}
