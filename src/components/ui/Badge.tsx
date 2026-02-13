'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'todo' | 'inProgress' | 'done' | 'carriedOver' | 'high' | 'medium' | 'low' | 'muted';
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<string, string> = {
  todo: 'bg-zinc-700 text-zinc-300',
  inProgress: 'bg-blue-900/50 text-blue-400',
  done: 'bg-green-900/50 text-green-400',
  carriedOver: 'bg-amber-900/50 text-amber-400',
  high: 'bg-red-900/50 text-red-400',
  medium: 'bg-yellow-900/50 text-yellow-400',
  low: 'bg-green-900/50 text-green-400',
  muted: 'bg-zinc-800 text-zinc-400',
};

export default function Badge({ children, variant = 'muted', onClick, className = '' }: BadgeProps) {
  const interactive = !!onClick;
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${variantStyles[variant] || variantStyles.muted}
        ${interactive ? 'cursor-pointer hover:opacity-80 active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
    >
      {children}
    </span>
  );
}
