import { supabase } from '@/lib/supabase';
import {
  MOCK_ADMIN_STATS,
  MOCK_ANNOUNCEMENTS,
  MOCK_CATEGORIES,
  MOCK_COMMENTS,
  MOCK_FRIENDS,
  MOCK_FRIEND_REQUESTS,
  MOCK_ME,
  MOCK_NOTIFICATIONS,
  MOCK_POSTS,
  MOCK_PRACTICE_QUESTIONS,
  MOCK_SENT_REQUESTS,
  MOCK_SLIDES,
} from '@/mocks';
import type {
  AdminStats,
  Announcement,
  CarouselSlide,
  Comment,
  ForumCategory,
  ForumPost,
  FriendRequest,
  Notification,
  PracticeQuestion,
  User,
  UserRole,
} from '@/types';

type DbRecord = Record<string, unknown>;

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function rows(value: unknown): DbRecord[] {
  return Array.isArray(value) ? value.filter((item): item is DbRecord => item && typeof item === 'object' && !Array.isArray(item)) : [];
}

function asRecord(value: unknown): DbRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as DbRecord : null;
}

function safeArray(value: unknown): DbRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is DbRecord => Boolean(item && typeof item === 'object' && !Array.isArray(item)));
  return [];
}

function normalizeRole(value: unknown): UserRole {
  const role = String(value || '').toLowerCase();
  if (role === 'owner' || role === 'superadmin') return 'superadmin';
  if (role === 'admin') return 'admin';
  if (role === 'moderator' || role === 'moderador') return 'moderator';
  return 'user';
}

function fallbackUsername(id: string, name = 'estudiante'): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 14) || `user${id.slice(0, 4)}`;
}

function mapProfile(row?: DbRecord | null): User {
  if (!row) return MOCK_ME;
  const id = text(row.id, 'anon');
  const displayName = text(row.full_name, text(row.email, 'Estudiante W&T'));
  const yearRaw = row.program_year;
  const parsedYear = typeof yearRaw === 'number' ? yearRaw : Number.parseInt(String(yearRaw || ''), 10);
  return {
    id,
    username: text(row.username, fallbackUsername(id, displayName)),
    displayName,
    avatar: text(row.photo_url, undefined as unknown as string) || undefined,
    role: normalizeRole(row.role),
    bio: text(row.bio, undefined as unknown as string) || undefined,
    country: text(row.country, undefined as unknown as string) || undefined,
    sponsor: text(row.sponsor, undefined as unknown as string) || undefined,
    year: Number.isFinite(parsedYear) ? parsedYear : undefined,
    friendCount: 0,
    postCount: 0,
    joinedAt: text(row.created_at, new Date().toISOString()),
    isOnline: false,
  };
}

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  visa: { icon: '🛂', color: '#2563eb' },
  sponsor: { icon: '🏢', color: '#7c3aed' },
  empleo: { icon: '💼', color: '#059669' },
  trabajo: { icon: '💼', color: '#059669' },
  viaje: { icon: '✈️', color: '#d97706' },
  alojamiento: { icon: '🏠', color: '#db2777' },
  experiencia: { icon: '🌟', color: '#ca8a04' },
  pregunta: { icon: '❓', color: '#64748b' },
  noticia: { icon: '📰', color: '#0891b2' },
};

function categoryMeta(name: string) {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const match = Object.entries(CATEGORY_META).find(([key]) => normalized.includes(key));
  return match?.[1] || { icon: '💬', color: '#2563eb' };
}

function mapCategory(row?: DbRecord | null, index = 0): ForumCategory {
  if (!row) return MOCK_CATEGORIES[index] || MOCK_CATEGORIES[0];
  const name = text(row.name, 'General');
  const meta = categoryMeta(name);
  return {
    id: text(row.id, `cat-${index}`),
    name,
    icon: meta.icon,
    color: meta.color,
  };
}

function mediaImages(row: DbRecord): string[] | undefined {
  const result = new Set<string>();
  const imageUrl = text(row.image_url, '');
  if (imageUrl) result.add(imageUrl);
  safeArray(row.attachments).forEach((item) => {
    const url = text(item.url, text(item.public_url, text(item.image_url, '')));
    const type = text(item.type, text(item.mime, '')).toLowerCase();
    if (url && (!type || type.includes('image'))) result.add(url);
  });
  return result.size ? Array.from(result) : undefined;
}

function mediaPdf(row: DbRecord): string | undefined {
  const first = safeArray(row.pdf_attachments)[0];
  if (!first) return undefined;
  return text(first.url, text(first.public_url, text(first.webViewLink, ''))) || undefined;
}

function mapPost(row: DbRecord, categories: Map<string, ForumCategory>, profiles: Map<string, User>, likedIds = new Set<string>()): ForumPost {
  const categoryId = text(row.category_id, '');
  const authorId = text(row.author_id, '');
  return {
    id: text(row.id, crypto.randomUUID()),
    title: text(row.title, 'Publicación sin título'),
    content: text(row.body, ''),
    category: categories.get(categoryId) || MOCK_CATEGORIES[0],
    author: profiles.get(authorId) || MOCK_ME,
    createdAt: text(row.created_at, new Date().toISOString()),
    updatedAt: text(row.updated_at, undefined as unknown as string) || undefined,
    likeCount: num(row.likes_count),
    commentCount: num(row.comments_count),
    isLiked: likedIds.has(text(row.id)),
    isSaved: false,
    images: mediaImages(row),
    pdfUrl: mediaPdf(row),
    isPinned: bool(row.featured, false),
    isReported: false,
  };
}

function mapComment(row: DbRecord, profiles: Map<string, User>, likedIds = new Set<string>()): Comment {
  const id = text(row.id, crypto.randomUUID());
  return {
    id,
    postId: text(row.post_id),
    author: profiles.get(text(row.author_id)) || MOCK_ME,
    content: text(row.body),
    createdAt: text(row.created_at, new Date().toISOString()),
    likeCount: num(row.likes_count),
    isLiked: likedIds.has(id),
    parentId: text(row.parent_comment_id, undefined as unknown as string) || undefined,
    replies: [],
  };
}

function nestComments(comments: Comment[]): Comment[] {
  const byId = new Map(comments.map((comment) => [comment.id, { ...comment, replies: [] as Comment[] }]));
  const roots: Comment[] = [];
  byId.forEach((comment) => {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)?.replies?.push(comment);
    } else {
      roots.push(comment);
    }
  });
  return roots;
}

async function fetchProfiles(ids: string[]): Promise<Map<string, User>> {
  const map = new Map<string, User>();
  const clean = Array.from(new Set(ids.filter(Boolean)));
  if (!supabase || !clean.length) return map;
  const { data, error } = await supabase.from('public_profiles').select('id,username,full_name,photo_url,role,status,bio,country,sponsor,program_year,created_at').in('id', clean);
  if (error) return map;
  rows(data).forEach((row) => {
    const user = mapProfile(row);
    map.set(user.id, user);
  });
  return map;
}

async function fetchCategoriesMap(): Promise<Map<string, ForumCategory>> {
  const list = await listForumCategories();
  return new Map(list.map((category) => [category.id, category]));
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function likedPostIds(postIds: string[]): Promise<Set<string>> {
  const userId = await currentUserId();
  if (!supabase || !userId || !postIds.length) return new Set();
  const { data, error } = await supabase.from('forum_likes').select('post_id').eq('target_type', 'post').eq('user_id', userId).in('post_id', postIds);
  if (error) return new Set();
  return new Set(rows(data).map((row) => text(row.post_id)).filter(Boolean));
}

async function likedCommentIds(commentIds: string[]): Promise<Set<string>> {
  const userId = await currentUserId();
  if (!supabase || !userId || !commentIds.length) return new Set();
  const { data, error } = await supabase.from('forum_likes').select('comment_id').eq('target_type', 'comment').eq('user_id', userId).in('comment_id', commentIds);
  if (error) return new Set();
  return new Set(rows(data).map((row) => text(row.comment_id)).filter(Boolean));
}

export async function getCurrentProfile(): Promise<User | null> {
  if (!supabase) return null;
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;
  const user = authData.user;
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
  if (!error && data) return mapProfile(asRecord(data));

  const fullName = text(user.user_metadata?.full_name, text(user.user_metadata?.name, user.email?.split('@')[0] || 'Estudiante'));
  const photoUrl = text(user.user_metadata?.avatar_url, text(user.user_metadata?.picture, ''));
  const username = fallbackUsername(user.id, fullName);
  const insert = { id: user.id, email: user.email, full_name: fullName, photo_url: photoUrl || null, username, username_normalized: username.toLowerCase(), role: 'user', status: 'active' };
  const created = await supabase.from('user_profiles').upsert(insert, { onConflict: 'id' }).select('*').maybeSingle();
  if (created.error) return mapProfile({ id: user.id, email: user.email, full_name: fullName, photo_url: photoUrl, username, role: 'user', created_at: new Date().toISOString() });
  return mapProfile(asRecord(created.data));
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) throw error;
  if (data.user) {
    const username = fallbackUsername(data.user.id, fullName);
    await supabase.from('user_profiles').upsert({ id: data.user.id, email, full_name: fullName, username, username_normalized: username.toLowerCase(), role: 'user', status: 'active' }, { onConflict: 'id' });
  }
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function updateMyProfile(values: Partial<User>): Promise<User | null> {
  if (!supabase) return null;
  const userId = await currentUserId();
  if (!userId) throw new Error('Debes iniciar sesión.');
  const updates = {
    full_name: values.displayName,
    username: values.username,
    username_normalized: values.username?.toLowerCase(),
    bio: values.bio,
    country: values.country,
    sponsor: values.sponsor,
    program_year: values.year ? String(values.year) : null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('user_profiles').update(updates).eq('id', userId).select('*').maybeSingle();
  if (error) throw error;
  return mapProfile(asRecord(data));
}

export async function listForumCategories(): Promise<ForumCategory[]> {
  if (!supabase) return MOCK_CATEGORIES;
  const { data, error } = await supabase.from('forum_categories').select('*').eq('active', true).order('sort_order', { ascending: true });
  if (error || !Array.isArray(data) || data.length === 0) return MOCK_CATEGORIES;
  return rows(data).map((row, index) => mapCategory(row, index));
}

export async function listForumPosts(): Promise<ForumPost[]> {
  if (!supabase) return MOCK_POSTS;
  const { data, error } = await supabase.from('forum_posts').select('*').eq('status', 'approved').order('last_activity_at', { ascending: false }).limit(80);
  if (error || !Array.isArray(data)) return MOCK_POSTS;
  const postRows = rows(data);
  const [categories, profiles, liked] = await Promise.all([
    fetchCategoriesMap(),
    fetchProfiles(postRows.map((row) => text(row.author_id))),
    likedPostIds(postRows.map((row) => text(row.id))),
  ]);
  const mapped = postRows.map((row) => mapPost(row, categories, profiles, liked));
  return mapped.length ? mapped : MOCK_POSTS;
}

export async function getForumPost(postId: string): Promise<ForumPost | null> {
  if (!supabase) return MOCK_POSTS.find((post) => post.id === postId) ?? null;
  const { data, error } = await supabase.from('forum_posts').select('*').eq('id', postId).maybeSingle();
  if (error || !data) return MOCK_POSTS.find((post) => post.id === postId) ?? null;
  const row = asRecord(data) as DbRecord;
  const [categories, profiles, liked] = await Promise.all([
    fetchCategoriesMap(),
    fetchProfiles([text(row.author_id)]),
    likedPostIds([text(row.id)]),
  ]);
  return mapPost(row, categories, profiles, liked);
}

export async function listPostComments(postId: string): Promise<Comment[]> {
  if (!supabase) return MOCK_COMMENTS.filter((comment) => comment.postId === postId || postId === 'p1');
  const { data, error } = await supabase.from('forum_comments').select('*').eq('post_id', postId).eq('status', 'approved').order('created_at', { ascending: true });
  if (error || !Array.isArray(data)) return MOCK_COMMENTS.filter((comment) => comment.postId === postId || postId === 'p1');
  const commentRows = rows(data);
  const [profiles, liked] = await Promise.all([
    fetchProfiles(commentRows.map((row) => text(row.author_id))),
    likedCommentIds(commentRows.map((row) => text(row.id))),
  ]);
  return nestComments(commentRows.map((row) => mapComment(row, profiles, liked)));
}

export async function createForumPost(input: { title: string; content: string; categoryId?: string | null }): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const userId = await currentUserId();
  if (!userId) throw new Error('Debes iniciar sesión para publicar.');
  const payload = { title: input.title.trim(), body: input.content.trim(), category_id: input.categoryId || null, author_id: userId, status: 'pending' };
  const { data, error } = await supabase.from('forum_posts').insert(payload).select('id').single();
  if (error) throw error;
  return text((data as DbRecord).id);
}

export async function addForumComment(postId: string, body: string, parentCommentId?: string | null): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const userId = await currentUserId();
  if (!userId) throw new Error('Debes iniciar sesión para comentar.');
  const { error } = await supabase.from('forum_comments').insert({ post_id: postId, body: body.trim(), author_id: userId, parent_comment_id: parentCommentId || null, status: 'pending' });
  if (error) throw error;
}

export async function togglePostLike(post: ForumPost): Promise<boolean> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const userId = await currentUserId();
  if (!userId) throw new Error('Debes iniciar sesión.');
  const existing = await supabase.from('forum_likes').select('id').eq('target_type', 'post').eq('post_id', post.id).eq('user_id', userId).maybeSingle();
  const existingId = text(asRecord(existing.data)?.id, '');
  if (existingId) {
    const { error } = await supabase.from('forum_likes').delete().eq('id', existingId).eq('user_id', userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('forum_likes').insert({ target_type: 'post', post_id: post.id, user_id: userId });
  if (error) throw error;
  return true;
}

export async function reportPost(postId: string, reason = 'Reporte desde React'): Promise<void> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const userId = await currentUserId();
  if (!userId) throw new Error('Debes iniciar sesión.');
  const { error } = await supabase.from('forum_reports').insert({ target_type: 'post', post_id: postId, reporter_id: userId, reason });
  if (error) throw error;
}

export async function listHomeSlides(): Promise<CarouselSlide[]> {
  if (!supabase) return MOCK_SLIDES;
  const { data, error } = await supabase.from('hero_slides').select('*').eq('active', true).order('sort_order', { ascending: true });
  if (error || !Array.isArray(data) || data.length === 0) return MOCK_SLIDES;
  return rows(data).map((row, index) => ({
    id: text(row.id, `slide-${index}`),
    title: text(row.title, 'Work and Travel RD'),
    subtitle: text(row.subtitle, ''),
    imageUrl: text(row.desktop_image_url, text(row.image_url, undefined as unknown as string)) || undefined,
    ctaText: text(row.button_text, undefined as unknown as string) || undefined,
    ctaUrl: text(row.button_url, undefined as unknown as string) || undefined,
    eyebrow: 'Comunidad J1',
    isActive: bool(row.active, true),
    order: num(row.sort_order, index),
  }));
}

export async function listAnnouncements(): Promise<Announcement[]> {
  if (!supabase) return MOCK_ANNOUNCEMENTS;
  const { data, error } = await supabase.from('announcements').select('*').eq('active', true).neq('type', 'popup').order('sort_order', { ascending: true }).limit(10);
  if (error || !Array.isArray(data) || data.length === 0) return MOCK_ANNOUNCEMENTS;
  return rows(data).map((row, index) => ({
    id: text(row.id, `ann-${index}`),
    title: text(row.title, 'Aviso'),
    content: text(row.description, ''),
    type: text(row.type, 'info') === 'banner' ? 'info' : text(row.featured, '') ? 'success' : 'info',
    isPublished: bool(row.active, true),
    createdAt: text(row.created_at, new Date().toISOString()),
    author: MOCK_ME,
  }));
}

export async function listNotifications(): Promise<Notification[]> {
  const userId = await currentUserId();
  if (!supabase || !userId) return MOCK_NOTIFICATIONS;
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(80);
  if (error || !Array.isArray(data)) return MOCK_NOTIFICATIONS;
  const notificationRows = rows(data);
  const profiles = await fetchProfiles(notificationRows.map((row) => text(row.actor_id)));
  return notificationRows.map((row) => ({
    id: text(row.id),
    type: ['like', 'comment', 'friend_request', 'message', 'mention', 'system'].includes(text(row.type)) ? text(row.type) as Notification['type'] : 'system',
    title: text(row.title, 'Notificación'),
    body: text(row.message, ''),
    fromUser: profiles.get(text(row.actor_id)),
    isRead: Boolean(row.read_at),
    createdAt: text(row.created_at, new Date().toISOString()),
    link: text(row.post_id) ? `/foro/${text(row.post_id)}` : undefined,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
}

export async function listFriendsData(): Promise<{ received: FriendRequest[]; friends: User[]; sent: FriendRequest[] }> {
  const userId = await currentUserId();
  if (!supabase || !userId) return { received: MOCK_FRIEND_REQUESTS, friends: MOCK_FRIENDS, sent: MOCK_SENT_REQUESTS };
  const { data, error } = await supabase.from('user_friendships').select('*').or(`requester_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false }).limit(120);
  if (error || !Array.isArray(data)) return { received: MOCK_FRIEND_REQUESTS, friends: MOCK_FRIENDS, sent: MOCK_SENT_REQUESTS };
  const friendshipRows = rows(data);
  const allUserIds = friendshipRows.flatMap((row) => [text(row.requester_id), text(row.receiver_id)]).filter((id) => id && id !== userId);
  const profiles = await fetchProfiles(allUserIds);
  const received: FriendRequest[] = [];
  const sent: FriendRequest[] = [];
  const friends: User[] = [];
  friendshipRows.forEach((row) => {
    const requester = text(row.requester_id);
    const receiver = text(row.receiver_id);
    const otherId = requester === userId ? receiver : requester;
    const other = profiles.get(otherId) || MOCK_ME;
    const status = text(row.status, 'pending') as FriendRequest['status'];
    if (status === 'accepted') friends.push(other);
    else if (status === 'pending' && receiver === userId) received.push({ id: text(row.id), from: other, to: MOCK_ME, status, createdAt: text(row.created_at) });
    else if (status === 'pending' && requester === userId) sent.push({ id: text(row.id), from: MOCK_ME, to: other, status, createdAt: text(row.created_at) });
  });
  return { received, friends, sent };
}

export async function listPracticeQuestions(): Promise<PracticeQuestion[]> {
  if (!supabase) return MOCK_PRACTICE_QUESTIONS;
  const { data, error } = await supabase.from('practice_questions').select('*').eq('active', true).order('sort_order', { ascending: true }).limit(120);
  if (error || !Array.isArray(data) || data.length === 0) return MOCK_PRACTICE_QUESTIONS;
  return rows(data).map((row, index) => ({
    id: text(row.id, `q-${index}`),
    question: text(row.question_text, 'Pregunta de práctica'),
    options: [text(row.suggested_answer, 'Respuesta sugerida')],
    correctIndex: 0,
    explanation: text(row.spanish_translation, text(row.notes, undefined as unknown as string)) || undefined,
    category: text(row.category_id, 'General'),
    difficulty: text(row.difficulty, 'medium').toLowerCase().includes('dif') ? 'hard' : text(row.difficulty, '').toLowerCase().includes('fac') ? 'easy' : 'medium',
  }));
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!supabase) return MOCK_ADMIN_STATS;
  const [users, posts, comments, reports] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
    supabase.from('forum_comments').select('id', { count: 'exact', head: true }),
    supabase.from('forum_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return {
    totalUsers: users.count ?? MOCK_ADMIN_STATS.totalUsers,
    activeUsers: MOCK_ADMIN_STATS.activeUsers,
    totalPosts: posts.count ?? MOCK_ADMIN_STATS.totalPosts,
    totalComments: comments.count ?? MOCK_ADMIN_STATS.totalComments,
    pendingReports: reports.count ?? MOCK_ADMIN_STATS.pendingReports,
    newUsersToday: MOCK_ADMIN_STATS.newUsersToday,
  };
}

export async function getPublicProfileByUsername(username: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('public_profiles').select('*').eq('username', username).maybeSingle();
  if (error || !data) return null;
  return mapProfile(asRecord(data));
}
