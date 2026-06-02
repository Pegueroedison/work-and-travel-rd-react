import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui';

export function NotFoundPage() {
  return <div className="page-shell page-pad"><div className="container"><EmptyState icon="🧭" title="Página no encontrada" description="La ruta no existe en este mock visual." action={{ label: 'Volver al inicio', onClick: () => { window.location.href = '/'; } }} /><p style={{ textAlign: 'center' }}><Link to="/" className="btn btn-ghost">Inicio</Link></p></div></div>;
}
