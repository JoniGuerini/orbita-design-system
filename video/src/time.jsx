import { createContext, useContext, useState } from 'react';
import { cubicBezier, motion, useMotionValueEvent, useTransform } from 'motion/react';

/*
 * Tudo no vídeo é função de um único relógio (`time`, em segundos).
 * Na prévia ele anda com o requestAnimationFrame; na renderização o render.mjs
 * posiciona o relógio quadro a quadro, então o MP4 sai sempre igual.
 */

export const TimeContext = createContext(null);
export const useTime = () => useContext(TimeContext);

// as curvas do Órbita (tokens/foundation.json › motion.easing)
export const EASE = {
  emphasized: cubicBezier(0.32, 0.72, 0, 1),
  standard: cubicBezier(0.2, 0, 0, 1),
  decelerate: cubicBezier(0, 0, 0, 1),
  accelerate: cubicBezier(0.3, 0, 1, 1),
  linear: (x) => x,
};

/** Interpola de `from` a `to` entre t0 e t1 (segundos), com a curva enfatizada por padrão. */
export function useT(t0, t1, from, to, ease = EASE.emphasized) {
  const time = useTime();
  return useTransform(time, [t0, t1], [from, to], { ease, clamp: true });
}

/** Vários pontos: useKeys([0, 1, 2], [a, b, c]). */
export function useKeys(times, values, ease = EASE.standard) {
  const time = useTime();
  return useTransform(time, times, values, { ease, clamp: true });
}

/** Vira true depois do instante t (para estados discretos: ligado, selecionado…). */
export function useAfter(t) {
  const time = useTime();
  const [on, setOn] = useState(() => time.get() >= t);
  useMotionValueEvent(time, 'change', (v) => setOn(v >= t));
  return on;
}

/** Entrada padrão: sobe e aparece. */
export function useEnter(t, { dur = 0.8, y = 24, x = 0, scale = 1 } = {}) {
  return {
    opacity: useT(t, t + dur * 0.6, 0, 1, EASE.standard),
    y: useT(t, t + dur, y, 0),
    x: useT(t, t + dur, x, 0),
    scale: useT(t, t + dur, scale, 1),
  };
}

export function Rise({ t, dur, y, x, scale, as = 'div', style, ...rest }) {
  const enter = useEnter(t, { dur, y, x, scale });
  const Tag = motion[as];
  return <Tag style={{ ...enter, ...style }} {...rest} />;
}

/** Número que conta de 0 até `to`. */
export function Count({ t, dur = 1.4, to, format = (n) => String(Math.round(n)) }) {
  const value = useT(t, t + dur, 0, to, EASE.decelerate);
  const text = useTransform(value, format);
  return <motion.span>{text}</motion.span>;
}

/**
 * Cena: só existe entre `from` e `to`; sai subindo e sumindo nos últimos `exit` segundos.
 */
export function Scene({ from, to, exit = 0.45, className = '', children, style }) {
  const time = useTime();
  const opacity = useTransform(time, [to - exit, to], [1, 0], { clamp: true, ease: EASE.standard });
  const y = useTransform(time, [to - exit, to], [0, -16], { clamp: true, ease: EASE.accelerate });
  const visibility = useTransform(time, (t) => (t >= from && t < to ? 'visible' : 'hidden'));
  return (
    <motion.section className={`scene ${className}`} style={{ opacity, y, visibility, ...style }}>
      {children}
    </motion.section>
  );
}
