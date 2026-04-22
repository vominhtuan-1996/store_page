import React from 'react';

interface HubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary' | 'danger';
  accent?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const HubButton: React.FC<HubButtonProps> = ({
  variant = 'ghost',
  accent,
  icon,
  size = 'md',
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const pad   = size === 'sm' ? '6px 14px' : '9px 20px';
  const fs    = size === 'sm' ? 11 : 12;

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: fs,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: pad,
    border: '1px solid',
    whiteSpace: 'nowrap' as const,
  };

  const variants: Record<string, React.CSSProperties> = {
    ghost: {
      background: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(255,255,255,0.10)',
      color: 'rgba(255,255,255,0.55)',
    },
    primary: {
      background: accent ? `${accent}18` : 'rgba(255,255,255,0.08)',
      borderColor: accent ? `${accent}40` : 'rgba(255,255,255,0.15)',
      color: accent ?? '#fff',
    },
    danger: {
      background: 'rgba(239,68,68,0.1)',
      borderColor: 'rgba(239,68,68,0.3)',
      color: '#f87171',
    },
  };

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLElement;
    if (variant === 'ghost') el.style.color = '#fff';
    else if (accent) el.style.background = `${accent}28`;
    onMouseEnter?.(e);
  };

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLElement;
    if (variant === 'ghost') el.style.color = 'rgba(255,255,255,0.55)';
    else if (accent) el.style.background = `${accent}18`;
    onMouseLeave?.(e);
  };

  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};

/* ── Shared tool page header ─────────────────────────────────────── */
interface ToolHeaderProps {
  title: string;
  subtitle?: string;
  accent: string;
  onBack?: () => void;
  action?: { label: string; icon?: React.ReactNode; onClick: () => void };
  right?: React.ReactNode;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title, subtitle, accent, onBack, action, right,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '28px 40px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      gap: 24,
      flexShrink: 0,
    }}
  >
    {/* Left */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {onBack && (
        <HubButton onClick={onBack}>← Back</HubButton>
      )}
      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>

    {/* Right */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {right}
      {action && (
        <HubButton variant="primary" accent={accent} icon={action.icon} onClick={action.onClick}>
          {action.label}
        </HubButton>
      )}
    </div>
  </div>
);
