import { motion, useTransform } from 'motion/react';
import { icon, icons } from '../../ds/icons/icons.js';
import { EASE, Rise, useKeys, useT, useTime } from './time.jsx';

export const ICON_NAMES = Object.keys(icons);

/** Os ícones reais do Órbita. `display: contents` para não criar uma caixa a mais no flex. */
export function Icon({ name, size = 20, className }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: icon(name, { size, className }) }} />;
}

/** Ícone que se desenha: cada traço ganha pathLength=1 e o CSS lê o progresso em --p. */
const drawable = (name, size, strokeWidth) =>
  icon(name, { size, strokeWidth }).replace(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="1"');

export function DrawIcon({ name, size = 24, strokeWidth, progress, className = '', style }) {
  const opacity = useTransform(progress, (p) => Math.min(1, p * 6));
  return (
    <motion.span
      className={`draw ${className}`}
      style={{ '--p': progress, opacity, ...style }}
      dangerouslySetInnerHTML={{ __html: drawable(name, size, strokeWidth) }}
    />
  );
}

export const CHEV = (
  <span className="ds-chip__chevron">
    <Icon name="chevron-down" size={14} />
  </span>
);

/* Cabeçalho de cena no padrão do painel “Roteiro”: carimbo pequeno + rótulo apagado, título apertado */
export function Head({ t = 0.2, stamp, label, title, compact, children }) {
  return (
    <header className={`head${compact ? ' head--compact' : ''}`}>
      <Rise t={t} as="p" className="ds-section__head" y={12}>
        <span className="ds-section__stamp">{stamp}</span>
        <span>{label}</span>
      </Rise>
      <Rise t={t + 0.1} as="h2" className="head__title" y={28}>
        {title}
      </Rise>
      {children && (
        <Rise t={t + 0.25} as="p" className="head__desc" y={16}>
          {children}
        </Rise>
      )}
    </header>
  );
}

export function Card({ t, className = '', children, style }) {
  return (
    <Rise t={t} dur={0.9} y={36} scale={0.97} className={`ds-card v-card ${className}`} style={style}>
      {children}
    </Rise>
  );
}

/** Aperto de botão. */
export function Press({ t, children, className = '' }) {
  const scale = useKeys([t, t + 0.08, t + 0.3], [1, 0.95, 1]);
  return (
    <motion.span className={className} style={{ scale, display: 'inline-flex' }}>
      {children}
    </motion.span>
  );
}

/** Texto sendo digitado, com cursor piscando. */
export function Typing({ t0, t1, text, placeholder, caret = true, className = '' }) {
  const time = useTime();
  const shown = useTransform(time, (t) => text.slice(0, Math.round(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) * text.length)));
  const blink = useTransform(time, (t) => (caret && t > t0 - 0.6 && t < t1 + 1.2 && Math.floor(t * 2.4) % 2 === 0 ? 1 : 0));
  const ph = useTransform(time, (t) => (t < t0 ? 1 : 0));
  return (
    <span className={`typing ${className}`}>
      {placeholder && (
        <motion.span className="ds-field__placeholder typing__ph" style={{ opacity: ph }}>
          {placeholder}
        </motion.span>
      )}
      <motion.span>{shown}</motion.span>
      <motion.span className="typing__caret" style={{ opacity: blink }} />
    </span>
  );
}

/** Ponteiro que passeia pela cena: keys = [[t, x, y], …]; `clicks` = instantes de clique. */
export function Cursor({ keys, clicks = [] }) {
  const times = keys.map((k) => k[0]);
  const x = useKeys(times, keys.map((k) => k[1]), EASE.emphasized);
  const y = useKeys(times, keys.map((k) => k[2]), EASE.emphasized);
  const time = useTime();
  const opacity = useTransform(time, [times[0], times[0] + 0.3, times.at(-1) - 0.1, times.at(-1) + 0.2], [0, 1, 1, 0], { clamp: true });
  const scale = useTransform(time, (t) => {
    const c = clicks.find((c) => t >= c && t < c + 0.25);
    return c == null ? 1 : 1 - 0.18 * Math.sin(((t - c) / 0.25) * Math.PI);
  });
  return (
    <motion.svg className="cursor" width="22" height="22" viewBox="0 0 24 24" style={{ x, y, opacity, scale }}>
      <path d="M5 3.5 19 10l-6.2 1.8L10 18z" />
    </motion.svg>
  );
}
