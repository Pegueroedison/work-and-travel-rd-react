export type Theme = 'light' | 'dark';
export type UserRole = 'user' | 'admin' | 'superadmin' | 'moderator';

export interface User { id:string; username:string; displayName:string; avatar?:string; role:UserRole; bio?:string; country?:string; sponsor?:string; year?:number; friendCount:number; postCount:number; joinedAt:string; isOnline?:boolean; }
export interface ForumCategory { id:string; name:string; icon:string; color:string; }
export interface ForumPost { id:string; title:string; content:string; category:ForumCategory; author:User; createdAt:string; updatedAt?:string; likeCount:number; commentCount:number; isLiked:boolean; isSaved:boolean; images?:string[]; pdfUrl?:string; isPinned?:boolean; isReported?:boolean; }
export interface Comment { id:string; postId:string; author:User; content:string; createdAt:string; likeCount:number; isLiked:boolean; parentId?:string; replies?:Comment[]; }
export interface Notification { id:string; type:'like'|'comment'|'friend_request'|'message'|'mention'|'system'; title:string; body:string; fromUser?:User; isRead:boolean; createdAt:string; link?:string; }
export interface Message { id:string; conversationId:string; senderId:string; content:string; imageUrl?:string; pdfUrl?:string; createdAt:string; isRead:boolean; }
export interface Conversation { id:string; participant:User; lastMessage:Message; unreadCount:number; isBlocked?:boolean; isMuted?:boolean; }
export interface FriendRequest { id:string; from:User; to:User; status:'pending'|'accepted'|'rejected'; createdAt:string; }
export interface Announcement { id:string; title:string; content:string; type:'info'|'warning'|'success'|'danger'; isPublished:boolean; createdAt:string; author:User; }
export interface BlogPost { id:string; title:string; slug:string; excerpt:string; content:string; coverImage?:string; author:User; category:string; isPublished:boolean; readTime:number; createdAt:string; }
export interface CarouselSlide { id:string; title:string; subtitle:string; imageUrl?:string; ctaText?:string; ctaUrl?:string; eyebrow?:string; isActive:boolean; order:number; }
export interface PracticeQuestion { id:string; question:string; options:string[]; correctIndex:number; explanation?:string; category:string; difficulty:'easy'|'medium'|'hard'; }
export interface PracticeSession { id:string; questions:PracticeQuestion[]; answers:(number|null)[]; startedAt:string; completedAt?:string; score?:number; }
export interface Country { code:string; name:string; flag:string; }
export interface AdminStats { totalUsers:number; activeUsers:number; totalPosts:number; totalComments:number; pendingReports:number; newUsersToday:number; }
export interface ToastItem { id:string; type:'success'|'error'|'warning'|'info'; title:string; message?:string; }
