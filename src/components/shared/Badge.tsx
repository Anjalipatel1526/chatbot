import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border';
  
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-accent/10 text-accent border-accent/20',
    neutral: 'bg-white/5 text-textSecondary border-border',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </span>
  );
};
export default Badge;
