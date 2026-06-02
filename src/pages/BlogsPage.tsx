import { Link, useParams } from 'react-router-dom';
import { MOCK_BLOGS } from '@/mocks';
import { Avatar, Badge, ErrorState } from '@/components/ui';
import { formatRelative } from '@/utils/format';

export function BlogsPage() {
  return <div className="page-shell page-pad"><div className="container"><div className="section-head"><div><span className="section-kicker">Contenido</span><h1 className="section-title">Blogs y guías</h1><p className="muted">Artículos administrables para informar a la comunidad.</p></div></div><div className="blog-grid">{MOCK_BLOGS.map((blog) => <Link key={blog.id} to={`/blogs/${blog.slug}`}><article className="card blog-card">{blog.coverImage ? <div className="blog-cover"><img src={blog.coverImage} alt={blog.title} /></div> : null}<div className="blog-body"><Badge variant="info">{blog.category}</Badge><h2 className="post-title" style={{ marginTop: 8 }}>{blog.title}</h2><p className="muted text-small line-clamp-2">{blog.excerpt}</p><div className="post-actions"><Avatar user={blog.author} size="xs" /><span>{blog.author.displayName} · {blog.readTime} min · {formatRelative(blog.createdAt)}</span></div></div></article></Link>)}</div></div></div>;
}

export function BlogDetailPage() {
  const { slug } = useParams();
  const blog = MOCK_BLOGS.find((item) => item.slug === slug);
  if (!blog) return <div className="page-shell page-pad"><ErrorState title="Blog no encontrado" /></div>;
  return <div className="page-shell page-pad"><article className="container" style={{ maxWidth: 820 }}>{blog.coverImage ? <div className="post-preview"><img src={blog.coverImage} alt={blog.title} /></div> : null}<div className="card card-pad grid gap-4" style={{ marginTop: 16 }}><Badge variant="info">{blog.category}</Badge><h1 className="section-title">{blog.title}</h1><div className="post-head"><Avatar user={blog.author} /><div><strong>{blog.author.displayName}</strong><p className="muted text-small">{blog.readTime} min · {formatRelative(blog.createdAt)}</p></div></div><p>{blog.excerpt}</p><p className="muted">{blog.content}</p></div></article></div>;
}
