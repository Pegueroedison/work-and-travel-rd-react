import { useState, type KeyboardEvent } from 'react';
import type { User } from '@/types';

interface AvatarProps {
  user?: Pick<User, 'displayName' | 'avatar'>;
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

export function Avatar({ user, src, name, size = 'md', className = '', onClick }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const imgSrc = imageError ? undefined : src || user?.avatar;
  const displayName = name || user?.displayName || '?';
  const initials = displayName.split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || '?';
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };
  return (
    <div className={`avatar avatar-${size} ${className}`.trim()} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={handleKeyDown}>
      {imgSrc ? <img src={imgSrc} alt={displayName} onError={() => setImageError(true)} /> : <span aria-hidden="true">{initials}</span>}
    </div>
  );
}
