import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminPage } from '@/pages/AdminPage';
import { BlogDetailPage, BlogsPage } from '@/pages/BlogsPage';
import { CreatePostPage } from '@/pages/CreatePostPage';
import { ForumPage } from '@/pages/ForumPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PracticePage } from '@/pages/PracticePage';
import { MyProfilePage, PublicProfilePage } from '@/pages/ProfilePages';
import { PostDetailPage } from '@/pages/PostDetailPage';

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/foro" element={<ForumPage />} />
        <Route path="/foro/crear" element={<CreatePostPage />} />
        <Route path="/foro/:postId" element={<PostDetailPage />} />
        <Route path="/perfil" element={<MyProfilePage />} />
        <Route path="/perfil/:username" element={<PublicProfilePage />} />
        <Route path="/amigos" element={<FriendsPage />} />
        <Route path="/mensajes" element={<MessagesPage />} />
        <Route path="/notificaciones" element={<NotificationsPage />} />
        <Route path="/practica" element={<PracticePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
