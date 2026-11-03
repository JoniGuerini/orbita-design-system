import { motion, useTransform } from 'motion/react';
import { Count, EASE, Rise, useEnter, useT } from '../time.jsx';
import { Head, Icon } from '../ui.jsx';

/* ───────── Abertura ───────── */

function Letter({ t, children }) {
  const enter = useEnter(t, { dur: 1.1, y: 90 });
  return (
    <motion.span className="intro__letter" style={enter}>
      {children}
    </motion.span>
  );
}

export function Intro() {
  // o nome entra solto e vai apertando até o tracking do display
  const letterSpacing = useT(0.3, 2.4, '0.04em', '-0.05em');
  return (
    <>
      <motion.h1 className="intro__logo" style={{ letterSpacing }}>
        {'Órbita'.split('').map((l, i) => (
          <Letter key={i} t={0.3 + i * 0.07}>
            {l}
          </Letter>
        ))}
      </motion.h1>
      <Rise t={1.7} as="p" className="intro__tag" y={14}>
        Escuro quente, plano e calmo.
      </Rise>
    </>
  );
}

/* ───────── Cores ───────── */

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const NEUTRAL = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '975'];
const ROWS = [
  ['brand', STEPS],
  ['neutral', NEUTRAL],
  ['clay', STEPS],
  ['sand', STEPS],
  ['ochre', STEPS],
  ['slate', STEPS],
  ['blue', STEPS],
  ['teal', STEPS],
  ['violet', STEPS],
];

function Swatch({ palette, step, r, c, dim }) {
  const t = 0.4 + (r + c) * 0.035;
  const isBrand = palette === 'brand' && step === '400';
  const enter = useEnter(t, { dur: 0.7, y: 10, scale: 0.6 });
  const grow = useT(3.4, 4.0, 1, 1.35);
  const opacity = useTransform([enter.opacity, dim], ([a, d]) => (isBrand ? a : a * d));
  return (
    <motion.span
      className={`swatch${isBrand ? ' swatch--brand' : ''}`}
      style={{ background: `var(--ds-color-${palette}-${step})`, ...enter, opacity, scale: isBrand ? grow : enter.scale }}
    />
  );
}

export function Colors() {
  const dim = useT(3.3, 3.9, 1, 0.22, EASE.standard);
  const callout = useEnter(3.75, { dur: 0.7, y: 10 });
  return (
    <>
      <Head t={0.2} stamp="01" label="Cores" title={<><Count t={0.3} dur={1.6} to={150} /> cores em OKLCH</>}>
        Paletas primitivas geradas por matiz e croma. Os componentes só enxergam os tokens semânticos.
      </Head>
      <div className="swatches">
        {ROWS.map(([palette, steps], r) => (
          <div className="swatches__row" key={palette}>
            {steps.map((step, c) => (
              <Swatch key={step} palette={palette} step={step} r={r} c={c} dim={dim} />
            ))}
          </div>
        ))}
        <motion.div className="callout" style={callout}>
          <span className="callout__dot" />
          <span className="callout__name">color.brand.400</span>
          <span className="callout__value">#ff945e</span>
        </motion.div>
      </div>
    </>
  );
}

/* ───────── Tipografia ───────── */

const TYPE = [
  ['display.lg', '64 / 64', 'type--display', 'Vamos construir.'],
  ['heading.lg', '26 / 32', 'type--heading', 'Planos, calmos e precisos'],
  ['body.lg', '18 / 32', 'type--body', 'Cada decisão visual vira um token.'],
  ['eyebrow', '13 / 18', 'type--eyebrow', '00 · Sobre'],
  ['code', '14 / 22', 'type--code', '--ds-text-display-lg'],
];

export function Type() {
  const letterSpacing = useT(1.0, 2.8, '0em', '-0.045em');
  return (
    <>
      <div className="type__left">
        <Rise t={0.2} as="p" className="ds-section__head" y={12}>
          <span className="ds-section__stamp">02</span>
          <span>Tipografia</span>
        </Rise>
        <Rise t={0.3} y={40}>
          <motion.p className="type__aa" style={{ letterSpacing }}>
            Aa
          </motion.p>
        </Rise>
        <Rise t={0.6} as="p" className="type__fonts" y={12}>
          Inter Tight · Inter · JetBrains Mono
        </Rise>
      </div>
      <div className="type__scale">
        <Rise t={0.4} as="p" className="type__count" y={12}>
          <Count t={0.5} dur={1.2} to={19} /> estilos de texto
        </Rise>
        {TYPE.map(([name, metric, cls, sample], i) => (
          <Rise key={name} t={0.7 + i * 0.16} className="type__row" x={40} y={0}>
            <span className="type__meta">
              <span>{name}</span>
              <span>{metric}</span>
            </span>
            <span className={`type__sample ${cls}`}>{sample}</span>
          </Rise>
        ))}
      </div>
    </>
  );
}

/* ───────── Números ───────── */

const STATS = [
  [150, 'cores em OKLCH'],
  [126, 'ícones próprios'],
  [16, 'componentes'],
  [6, 'formas de gráfico'],
  [3, 'idiomas'],
];

export function Numbers() {
  return (
    <>
      <Rise t={0.2} as="p" className="ds-section__head" y={12}>
        <span className="ds-section__stamp">10</span>
        <span>O sistema em números</span>
      </Rise>
      <div className="stats">
        {STATS.map(([value, label], i) => (
          <Rise key={label} t={0.35 + i * 0.1} className="stat" y={30}>
            <p className="stat__value">
              <Count t={0.4 + i * 0.1} dur={1.5} to={value} />
            </p>
            <p className="stat__label">{label}</p>
          </Rise>
        ))}
      </div>
      <Rise t={1.3} as="p" className="numbers__note" y={12}>
        <Icon name="check" size={16} />
        70 de 70 pares de contraste passam no WCAG · dois temas · plugin do Figma
      </Rise>
    </>
  );
}

/* ───────── Encerramento ───────── */

function Word({ t, children }) {
  const enter = useEnter(t, { dur: 1, y: 50 });
  return (
    <motion.span className="outro__word" style={enter}>
      {children}
    </motion.span>
  );
}

export function Outro() {
  const words = 'Vamos construir com refinamento.'.split(' ');
  return (
    <>
      <Rise t={0.2} as="p" className="outro__logo" y={12}>
        Órbita
      </Rise>
      <h2 className="outro__title">
        {words.map((w, i) => (
          <Word key={i} t={0.4 + i * 0.12}>
            {w}
          </Word>
        ))}
      </h2>
      <Rise t={1.3} className="outro__actions" y={16}>
        <span className="ds-btn ds-btn--primary ds-btn--lg"><Icon name="zap" />Começar agora</span>
        <span className="ds-btn ds-btn--secondary ds-btn--lg">Ver componentes</span>
      </Rise>
      <Rise t={1.8} as="p" className="outro__url" y={10}>
        orbita-design-system.vercel.app
      </Rise>
    </>
  );
}
