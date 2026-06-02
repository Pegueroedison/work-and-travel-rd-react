import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BLOGS } from '@/mocks';
import type { Announcement, CarouselSlide, ForumPost } from '@/types';
import { Avatar, Badge, LoadingState } from '@/components/ui';
import { formatRelative } from '@/utils/format';
import { listAnnouncements, listForumPosts, listHomeSlides } from '@/services/supabaseApi';

const quickLinks = [
  { icon: '💬', label: 'Foro', path: '/foro' },
  { icon: '✏️', label: 'Práctica', path: '/practica' },
  { icon: '📝', label: 'Blogs', path: '/blogs' },
  { icon: '👫', label: 'Amigos', path: '/amigos' },
  { icon: '🔔', label: 'Avisos', path: '/notificaciones' },
];

export function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listHomeSlides(), listAnnouncements(), listForumPosts()])
      .then(([slideData, announcementData, postData]) => {
        if (!active) return;
        setSlides(slideData.filter((slide) => slide.isActive).sort((a, b) => a.order - b.order));
        setAnnouncements(announcementData.filter((item) => item.isPublished));
        setPosts(postData.slice(0, 3));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[slideIndex];
  const blogs = useMemo(() => MOCK_BLOGS, []);

  if (loading && !slide) return <div className="page-shell page-pad"><LoadingState text="Cargando contenido desde Supabase..." /></div>;

  return (
    <div className="page-shell">
      <section className="hero" aria-label="Carrusel principal">
        {slide?.imageUrl ? <div className="hero-bg" style={{ backgroundImage: `url(${slide.imageUrl})` }} /> : null}
        <div className="hero-overlay" />
        <div className="container hero-content">
          {slide?.eyebrow ? <span className="hero-eyebrow">{slide.eyebrow}</span> : null}
          <h1 className="hero-title">{slide?.title || 'Work and Travel RD'}</h1>
          <p className="hero-subtitle">{slide?.subtitle || 'Comunidad dominicana para estudiantes J1.'}</p>
          <div className="hero-actions">
            {slide?.ctaText && slide.ctaUrl ? <Link to={slide.ctaUrl} className="btn btn-primary btn-lg">{slide.ctaText}</Link> : null}
            <Link to="/foro" className="btn btn-lg glass-light-btn">Explorar foro</Link>
          </div>
        </div>
        <div className="hero-dots">{slides.map((item, index) => <button key={item.id} onClick={() => setSlideIndex(index)} aria-label={`Slide ${index + 1}`} className={`hero-dot ${index === slideIndex ? 'active' : ''}`} />)}</div>
      </section>

      <section className="container page-pad">
        <div className="section-head"><div><span className="section-kicker">Avisos</span><h2 className="section-title">Anuncios importantes</h2></div></div>
        <div className="grid gap-3">{announcements.map((announcement) => <article key={announcement.id} className="card card-pad post-head"><span>{announcement.type === 'warning' ? '⚠️' : announcement.type === 'success' ? '✅' : announcement.type === 'danger' ? '🚨' : 'ℹ️'}</span><div><h3 className="text-small">{announcement.title}</h3><p className="muted text-small">{announcement.content}</p></div></article>)}</div>
      </section>

      <section className="container page-pad">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Explorar</h2>
        <div className="home-grid">{quickLinks.map((item) => <Link key={item.path} to={item.path}><div className="card quick-card"><div className="quick-card__icon">{item.icon}</div><div className="quick-card__label">{item.label}</div></div></Link>)}</div>
      </section>

      <section className="container page-pad">
        <div className="section-head"><h2 className="section-title">Del foro</h2><Link to="/foro" className="btn btn-ghost btn-sm">Ver todo →</Link></div>
        <div className="grid gap-3">{posts.map((post) => <Link key={post.id} to={`/foro/${post.id}`}><article className="card post-card"><div className="post-head"><Avatar user={post.author} size="sm" /><div><div className="post-meta"><Badge>{post.category.icon} {post.category.name}</Badge>{post.isPinned ? <Badge variant="warning">📌 Destacado</Badge> : null}</div><h3 className="post-title">{post.title}</h3><div className="post-actions"><span>❤️ {post.likeCount}</span><span>💬 {post.commentCount}</span><span>{formatRelative(post.createdAt)}</span></div></div></div></article></Link>)}</div>
      </section>

      <section className="container page-pad">
        <div className="section-head"><h2 className="section-title">Blogs</h2><Link to="/blogs" className="btn btn-ghost btn-sm">Ver todo →</Link></div>
        <div className="blog-grid">{blogs.map((blog) => <Link key={blog.id} to={`/blogs/${blog.slug}`}><article className="card blog-card">{blog.coverImage ? <div className="blog-cover"><img src={blog.coverImage} alt={blog.title} /></div> : null}<div className="blog-body"><Badge variant="info">{blog.category}</Badge><h3 className="post-title" style={{ marginTop: 8 }}>{blog.title}</h3><p className="muted text-small line-clamp-2">{blog.excerpt}</p><div className="post-actions"><Avatar user={blog.author} size="xs" /><span>{blog.author.displayName} · {blog.readTime} min</span></div></div></article></Link>)}</div>
      </section>
    </div>
  );
}
