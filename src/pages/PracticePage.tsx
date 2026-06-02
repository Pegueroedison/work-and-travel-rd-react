import { useEffect, useState } from 'react';
import type { PracticeQuestion } from '@/types';
import { Badge, Button, LoadingState, ProgressBar, Tabs } from '@/components/ui';
import { listPracticeQuestions } from '@/services/supabaseApi';

export function PracticePage() {
  const [mode, setMode] = useState<'normal' | 'live'>('normal');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listPracticeQuestions().then((data) => active && setQuestions(data)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <div className="page-shell page-pad"><LoadingState text="Cargando preguntas desde Supabase..." /></div>;
  const question = questions[questionIndex] || questions[0];

  return <div className="page-shell page-pad"><div className="container" style={{ maxWidth: 880 }}><div className="section-head"><div><span className="section-kicker">Preparación</span><h1 className="section-title">Práctica consular</h1><p className="muted">Práctica normal conectada a `practice_questions` y práctica en vivo preparada visualmente.</p></div></div><Tabs activeId={mode} onChange={(id) => setMode(id as 'normal' | 'live')} items={[{ id:'normal', label:'Práctica normal', icon:'📝 ' },{ id:'live', label:'Práctica en vivo', icon:'🎙️ ' }]} />{mode === 'normal' && question ? <section className="card practice-card" style={{ marginTop: 16 }}><div className="post-meta"><Badge variant="info">{question.category}</Badge><Badge variant="neutral">{question.difficulty}</Badge></div><ProgressBar value={((questionIndex + 1) / questions.length) * 100} label={`Pregunta ${questionIndex + 1} de ${questions.length}`} /><h2>{question.question}</h2><div className="practice-options">{question.options.map((option, index) => <button key={`${question.id}-${option}-${index}`} className={`practice-option ${selected === index ? 'selected' : ''}`} onClick={() => setSelected(index)}>{option}</button>)}</div>{selected !== null ? <p className="muted text-small"><strong>{selected === question.correctIndex ? 'Correcto.' : 'Revisa esta respuesta.'}</strong> {question.explanation}</p> : null}<div className="hero-actions"><Button variant="ghost" disabled={questionIndex === 0} onClick={() => { setQuestionIndex((value) => Math.max(0, value - 1)); setSelected(null); }}>Anterior</Button><Button onClick={() => { setQuestionIndex((value) => (value + 1) % questions.length); setSelected(null); }}>Siguiente</Button></div></section> : <section className="card practice-card" style={{ marginTop: 16 }}><Badge variant="success">En vivo</Badge><h2>Salas de práctica en vivo</h2><p className="muted">Pantalla lista para conectar turnos, moderación, notificaciones y salas sin marcas externas.</p><div className="admin-grid"><div className="card card-pad"><h3>Sala principiantes</h3><p className="muted text-small">12 participantes · moderador disponible</p><Button size="sm">Entrar</Button></div><div className="card card-pad"><h3>Simulación de entrevista</h3><p className="muted text-small">4 participantes · práctica guiada</p><Button size="sm">Reservar turno</Button></div></div></section>}</div></div>;
}
