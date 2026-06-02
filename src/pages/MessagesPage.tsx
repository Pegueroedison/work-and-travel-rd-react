import { useState } from 'react';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/mocks';
import { Avatar, Button, FilePreview, Input, UserRow } from '@/components/ui';

export function MessagesPage() {
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0]?.id || '');
  const conversation = MOCK_CONVERSATIONS.find((item) => item.id === activeId) || MOCK_CONVERSATIONS[0];
  const messages = MOCK_MESSAGES[conversation.id] || [];
  return <div className="page-shell"><div className="messages-layout"><aside className="messages-sidebar">{MOCK_CONVERSATIONS.map((item) => <UserRow key={item.id} user={item.participant} subtitle={`${item.lastMessage.content}${item.isMuted ? ' · Silenciado' : ''}`} onClick={() => setActiveId(item.id)} actions={item.unreadCount ? <span className="badge badge-secondary">{item.unreadCount}</span> : null} />)}</aside><main className="messages-chat"><div className="card-pad" style={{ borderBottom: '1px solid var(--color-border)' }}><div className="post-head"><Avatar user={conversation.participant} /><div><h1 className="text-small">{conversation.participant.displayName}</h1><p className="muted text-xs">@{conversation.participant.username}</p></div><div className="header-actions"><Button variant="ghost" size="sm">Silenciar</Button><Button variant="ghost" size="sm">Bloquear</Button><Button variant="ghost" size="sm">Reportar</Button></div></div></div><div className="chat-thread">{messages.map((message) => <div key={message.id} className={`message-bubble ${message.senderId === 'me' ? 'me' : ''}`}>{message.content}{message.imageUrl ? <FilePreview name="imagen.jpg" type="image" /> : null}{message.pdfUrl ? <FilePreview name="archivo.pdf" type="pdf" /> : null}</div>)}</div><form className="chat-composer"><Button type="button" variant="ghost" size="icon">📎</Button><Input placeholder="Escribe un mensaje..." aria-label="Mensaje" /><Button type="submit">Enviar</Button></form></main></div></div>;
}
