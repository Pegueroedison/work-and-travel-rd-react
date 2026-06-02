import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, ErrorState, LoadingState, Textarea } from '@/components/ui';
import { formatRelative } from '@/utils/format';
import type { Comment, ForumPost } from '@/types';
import { addForumComment, getForumPost, listPostComments, reportPost, togglePostLike } from '@/services/supabaseApi';
import { useApp } from '@/utils/AppContext';

export function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useApp();
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!postId) return;
    setLoading(true);
    const [postData, commentData] = await Promise.all([getForumPost(postId), listPostComments(postId)]);
    setPost(postData);
    setComments(commentData);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [postId]);

  async function handleComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postId) return;
    if (!currentUser) {
      showToast({ type: 'warning', title: 'Inicia sesión', message: 'Debes entrar para comentar.' });
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      await addForumComment(postId, body, replyingTo?.id);
      setBody('');
      setReplyingTo(null);
      showToast({ type: 'success', title: 'Comentario enviado', message: 'Quedará visible al aprobarse.' });
      await load();
    } catch (error) {
      showToast({ type: 'error', title: 'No se pudo comentar', message: error instanceof Error ? error.message : 'Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike() {
    if (!post) return;
    try {
      const liked = await togglePostLike(post);
      setPost({ ...post, isLiked: liked, likeCount: post.likeCount + (liked ? 1 : -1) });
    } catch (error) {
      showToast({ type: 'warning', title: 'Inicia sesión', message: error instanceof Error ? error.message : 'No se pudo registrar el like.' });
    }
  }

  async function handleReport() {
    if (!post) return;
    try {
      await reportPost(post.id);
      showToast({ type: 'success', title: 'Reporte enviado' });
    } catch (error) {
      showToast({ type: 'warning', title: 'No se pudo reportar', message: error instanceof Error ? error.message : 'Intenta iniciar sesión.' });
    }
  }

  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando publicación..." /></div>;
  if (!post) return <div className="page-shell page-pad"><ErrorState title="Publicación no encontrada" description="No encontramos esta publicación en Supabase ni en el respaldo mock." /></div>;

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 860 }}><Link to="/foro" className="btn btn-ghost btn-sm">← Volver al foro</Link><article className="card card-pad grid gap-4" style={{ marginTop: 16 }}><div className="post-meta"><Badge>{post.category.icon} {post.category.name}</Badge>{post.isPinned ? <Badge variant="warning">📌 Fijado</Badge> : null}</div><h1 className="section-title">{post.title}</h1><div className="post-head"><Avatar user={post.author} size="md" /><div><strong>{post.author.displayName}</strong><p className="muted text-small">@{post.author.username} · {formatRelative(post.createdAt)}</p></div></div><p>{post.content}</p>{post.images?.map((image) => <div className="post-preview" key={image}><img src={image} alt="Adjunto" /></div>)}<div className="post-actions"><Button variant="ghost" size="sm" onClick={handleLike}>{post.isLiked ? '❤️' : '🤍'} {post.likeCount}</Button><Button variant="ghost" size="sm">🔖 Guardar</Button><Button variant="ghost" size="sm" onClick={handleReport}>🚩 Reportar</Button></div></article><section className="card card-pad grid gap-4" style={{ marginTop: 16 }}><h2>Comentarios</h2>{replyingTo ? <Badge variant="info">Respondiendo a @{replyingTo.author.username}</Badge> : null}<form className="grid gap-3" onSubmit={handleComment}><Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Escribe un comentario. Usa @username para mencionar." required minLength={2} /><div className="post-actions"><Button size="sm" loading={submitting}>Comentar</Button>{replyingTo ? <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancelar respuesta</Button> : null}</div></form><div className="divider" />{comments.map((comment) => <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} />)}</section></div></div>;
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (comment: Comment) => void }) {
  return <div className="grid gap-3" style={{ marginBottom: 16 }}><div className="post-head"><Avatar user={comment.author} size="sm" /><div style={{ flex: 1 }}><strong>{comment.author.displayName}</strong><p className="muted text-xs">@{comment.author.username} · {formatRelative(comment.createdAt)}</p><p className="text-small">{comment.content}</p><div className="post-actions"><button className="btn btn-ghost btn-sm">❤️ {comment.likeCount}</button><button className="btn btn-ghost btn-sm" onClick={() => onReply(comment)}>Responder</button></div></div></div>{comment.replies?.map((reply) => <div key={reply.id} style={{ marginLeft: 36 }}><CommentItem comment={reply} onReply={onReply} /></div>)}</div>;
}
