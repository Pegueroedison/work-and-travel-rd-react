import { useEffect, useState } from 'react';
import { Accordion, Button, LoadingState, UserRow } from '@/components/ui';
import type { FriendRequest, User } from '@/types';
import { listFriendsData } from '@/services/supabaseApi';

export function FriendsPage() {
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listFriendsData().then((data) => {
      if (!active) return;
      setReceived(data.received);
      setFriends(data.friends);
      setSent(data.sent);
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando amigos..." /></div>;

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 820 }}><div className="section-head"><div><span className="section-kicker">Comunidad</span><h1 className="section-title">Amigos</h1><p className="muted">Solicitudes recibidas, amigos y solicitudes enviadas desde Supabase.</p></div></div><Accordion items={[{ id:'received', trigger:`Solicitudes recibidas (${received.length})`, defaultOpen:true, content:<div>{received.map((request) => <UserRow key={request.id} user={request.from} subtitle="Quiere ser tu amigo" actions={<><Button size="sm">Aceptar</Button><Button variant="ghost" size="sm">Rechazar</Button></>} />)}</div> },{ id:'friends', trigger:`Mis amigos (${friends.length})`, defaultOpen:true, content:<div>{friends.map((friend) => <UserRow key={friend.id} user={friend} subtitle={friend.bio} actions={<Button variant="ghost" size="sm">Mensaje</Button>} />)}</div> },{ id:'sent', trigger:`Solicitudes enviadas (${sent.length})`, content:<div>{sent.map((request) => <UserRow key={request.id} user={request.to} subtitle="Pendiente" actions={<Button variant="ghost" size="sm">Cancelar</Button>} />)}</div> }]} /></div></div>;
}
