import { motion, useTransform } from 'motion/react';
import { Count, EASE, Rise, Scene, useAfter, useEnter, useKeys, useT, useTime } from './time.jsx';
import { Icon } from './icon.jsx';

/* Linha do tempo (segundos) */
export const TIMELINE = {
  intro: [0, 4.6],
  colors: [4.6, 10.4],
  type: [10.4, 15.6],
  components: [15.6, 25.2],
  charts: [25.2, 30.6],
  numbers: [30.6, 34.6],
  outro: [34.6, 39.5],
};
export const DURATION = 39.5;

/* Cabeçalho de cena no padrão do painel “Roteiro”: carimbo pequeno + rótulo apagado, título apertado */
function Head({ t, stamp, label, title, children }) {
  return (
    <header className="head">
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

/* ───────── 1 · Abertura ───────── */

function Letter({ t, children }) {
  const enter = useEnter(t, { dur: 1.1, y: 90 });
  return (
    <motion.span className="intro__letter" style={enter}>
      {children}
    </motion.span>
  );
}

export function Intro() {
  const [from, to] = TIMELINE.intro;
  // o nome entra solto e vai apertando até o tracking do display
  const letterSpacing = useT(0.3, 2.4, '0.04em', '-0.05em');
  return (
    <Scene from={from} to={to} className="intro">
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
    </Scene>
  );
}

/* ───────── 2 · Cores ───────── */

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
  const t = 5.0 + (r + c) * 0.035;
  const isBrand = palette === 'brand' && step === '400';
  const enter = useEnter(t, { dur: 0.7, y: 10, scale: 0.6 });
  const grow = useT(8.0, 8.6, 1, 1.35);
  const opacity = useTransform([enter.opacity, dim], ([a, d]) => (isBrand ? a : a * d));
  return (
    <motion.span
      className={`swatch${isBrand ? ' swatch--brand' : ''}`}
      style={{ background: `var(--ds-color-${palette}-${step})`, ...enter, opacity, scale: isBrand ? grow : enter.scale }}
    />
  );
}

export function Colors() {
  const [from, to] = TIMELINE.colors;
  const dim = useT(7.9, 8.5, 1, 0.22, EASE.standard);
  const callout = useEnter(8.35, { dur: 0.7, y: 10 });
  return (
    <Scene from={from} to={to} className="split">
      <Head t={4.8} stamp="01" label="Cores" title={<><Count t={4.9} dur={1.6} to={150} /> cores em OKLCH</>}>
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
    </Scene>
  );
}

/* ───────── 3 · Tipografia ───────── */

const TYPE = [
  ['display.lg', '64 / 64', 'type--display', 'Vamos construir.'],
  ['heading.lg', '26 / 32', 'type--heading', 'Planos, calmos e precisos'],
  ['body.lg', '18 / 32', 'type--body', 'Cada decisão visual vira um token.'],
  ['eyebrow', '13 / 18', 'type--eyebrow', '00 · Sobre'],
  ['code', '14 / 22', 'type--code', '--ds-text-display-lg'],
];

export function Type() {
  const [from, to] = TIMELINE.type;
  const letterSpacing = useT(11.4, 13.2, '0em', '-0.045em');
  return (
    <Scene from={from} to={to} className="type">
      <div className="type__left">
        <Rise t={10.6} as="p" className="ds-section__head" y={12}>
          <span className="ds-section__stamp">02</span>
          <span>Tipografia</span>
        </Rise>
        <Rise t={10.7} y={40}>
          <motion.p className="type__aa" style={{ letterSpacing }}>
            Aa
          </motion.p>
        </Rise>
        <Rise t={11.0} as="p" className="type__fonts" y={12}>
          Inter Tight · Inter · JetBrains Mono
        </Rise>
      </div>
      <div className="type__scale">
        <Rise t={10.8} as="p" className="type__count" y={12}>
          <Count t={10.9} dur={1.2} to={19} /> estilos de texto
        </Rise>
        {TYPE.map(([name, metric, cls, sample], i) => (
          <Rise key={name} t={11.1 + i * 0.16} className="type__row" x={40} y={0}>
            <span className="type__meta">
              <span>{name}</span>
              <span>{metric}</span>
            </span>
            <span className={`type__sample ${cls}`}>{sample}</span>
          </Rise>
        ))}
      </div>
    </Scene>
  );
}

/* ───────── 4 · Componentes ───────── */

const CHEV = (
  <span className="ds-chip__chevron">
    <Icon name="chevron-down" size={14} />
  </span>
);

function Typing({ t0, t1, text }) {
  const time = useTime();
  const shown = useTransform(time, (t) => text.slice(0, Math.round(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) * text.length)));
  const caret = useTransform(time, (t) => (t > t0 - 0.6 && t < t1 + 1.2 && Math.floor(t * 2.4) % 2 === 0 ? 1 : 0));
  const placeholder = useTransform(time, (t) => (t < t0 ? 1 : 0));
  return (
    <span className="typing">
      <motion.span className="ds-field__placeholder typing__ph" style={{ opacity: placeholder }}>
        Buscar
      </motion.span>
      <motion.span>{shown}</motion.span>
      <motion.span className="typing__caret" style={{ opacity: caret }} />
    </span>
  );
}

function Switch({ t, label }) {
  const x = useT(t, t + 0.3, 0, 16);
  const on = useT(t, t + 0.25, 0, 1, EASE.standard);
  return (
    <span className="v-switch">
      <span className="v-switch__track">
        <motion.span className="v-switch__on" style={{ opacity: on }} />
        <motion.span className="v-switch__thumb" style={{ x }} />
      </span>
      <span className="v-switch__label">{label}</span>
    </span>
  );
}

const SEG = [
  ['monitor', 'Sistema'],
  ['moon', 'Escuro'],
  ['sun', 'Claro'],
];
export const SEG_SWITCH = 21.0; // quando o segmentado vai para “Claro”

function Segmented() {
  const x = useT(SEG_SWITCH, SEG_SWITCH + 0.45, 96, 192);
  const light = useAfter(SEG_SWITCH + 0.15);
  const selected = light ? 2 : 1;
  return (
    <div className="v-seg">
      <motion.span className="v-seg__thumb" style={{ x }} />
      {SEG.map(([ic, label], i) => (
        <span key={label} className={`v-seg__item${i === selected ? ' is-on' : ''}`}>
          <Icon name={ic} size={16} />
          {label}
        </span>
      ))}
    </div>
  );
}

function Card({ t, className = '', children }) {
  return (
    <Rise t={t} dur={0.9} y={36} scale={0.97} className={`ds-card v-card ${className}`}>
      {children}
    </Rise>
  );
}

function Press({ t, children }) {
  const scale = useKeys([t, t + 0.08, t + 0.3], [1, 0.95, 1]);
  return <motion.span style={{ scale, display: 'inline-flex' }}>{children}</motion.span>;
}

export function ComponentsBoard() {
  const toast = useEnter(19.8, { dur: 0.6, y: 14 });
  const toastOut = useT(24.4, 24.7, 1, 0, EASE.standard);
  const toastOpacity = useTransform([toast.opacity, toastOut], ([a, b]) => a * b);
  return (
    <>
      <Head t={15.8} stamp="03" label="Componentes" title="Planos, calmos e precisos">
        Contornos finos, nada de brilho. 16 componentes com anatomia, estados e acessibilidade.
      </Head>
      <div className="board">
        <Card t={16.1} className="board__panel">
          <div className="v-panel__head">
            <div>
              <p className="ds-panel__eyebrow">Roteiro</p>
              <p className="v-panel__title">Lançamento da versão 0.7</p>
            </div>
            <div className="v-panel__icons">
              <span className="ds-icon-btn"><Icon name="stack" /></span>
              <span className="ds-icon-btn"><Icon name="x" /></span>
            </div>
          </div>
          <div className="v-panel__chips">
            <span className="ds-chip ds-chip--sm">
              <span className="ds-chip__icon"><Icon name="pencil" size={14} /></span>Tom direto{CHEV}
            </span>
            <span className="ds-chip ds-chip--sm">Escuro{CHEV}</span>
            <span className="v-panel__meta">~3 min</span>
          </div>
          <p className="ds-section__head"><span className="ds-section__stamp">00</span><span>Sobre</span></p>
          <p className="v-panel__text">Cores, tipografia e ícones já estão em tokens, nos dois temas.</p>
          <span className="ds-inline-action">
            <Icon name="file-text" size={16} />Na cena<Icon name="plus" size={14} className="ds-inline-action__plus" />
          </span>
        </Card>

        <Card t={16.25} className="board__buttons">
          <p className="ds-panel__eyebrow">Botão</p>
          <div className="row">
            <Press t={19.4}>
              <span className="ds-btn ds-btn--primary"><Icon name="pencil" size={18} />Criar</span>
            </Press>
            <span className="ds-btn ds-btn--secondary">Cancelar</span>
            <span className="ds-icon-btn ds-icon-btn--outline"><Icon name="more-horizontal" /></span>
          </div>
        </Card>

        <Card t={16.4} className="board__search">
          <p className="ds-panel__eyebrow">Busca</p>
          <div className="ds-field v-field">
            <Icon name="search" size={18} />
            <Typing t0={17.4} t1={18.2} text="Seleção" />
            <kbd className="ds-kbd">⌘K</kbd>
          </div>
          <div className="row">
            <span className="ds-badge ds-badge--success"><span className="ds-badge__dot" />Pronto</span>
            <span className="ds-badge ds-badge--brand">Novo</span>
            <span className="ds-badge">Beta</span>
          </div>
        </Card>

        <Card t={16.55} className="board__settings">
          <p className="ds-panel__eyebrow">Ajustes</p>
          <Switch t={18.7} label="Notificações" />
          <Segmented />
        </Card>
      </div>
      <motion.div className="v-toast" style={{ ...toast, opacity: toastOpacity }}>
        <div className="ds-toast ds-toast--success" data-open="">
          <span className="ds-toast__icon"><Icon name="check" size={18} /></span>
          <span className="ds-toast__message">Projeto criado</span>
        </div>
      </motion.div>
    </>
  );
}

export function Components() {
  const [from, to] = TIMELINE.components;
  const time = useTime();
  // o tema claro abre em círculo a partir do segmentado
  const radius = useT(SEG_SWITCH + 0.25, SEG_SWITCH + 1.35, 0, 1600, EASE.emphasized);
  const clipPath = useTransform(radius, (r) => `circle(${r}px at 1106px 559px)`);
  const lightVisible = useTransform(time, (t) => (t > SEG_SWITCH + 0.25 ? 'visible' : 'hidden'));
  return (
    <Scene from={from} to={to} className="components">
      <div className="layer">
        <ComponentsBoard />
      </div>
      <motion.div className="layer layer--light" data-theme="light" style={{ clipPath, visibility: lightVisible }}>
        <ComponentsBoard />
      </motion.div>
    </Scene>
  );
}

/* ───────── 5 · Gráficos ───────── */

const series = (n) => `var(--ds-color-chart-series-${n})`;
const BARS = [38, 52, 46, 64, 58, 72, 86];
const LINE_A = [44, 40, 46, 36, 30, 32, 22, 14];
const LINE_B = [58, 56, 52, 52, 46, 47, 42, 40];
const linePath = (v) => v.map((y, i) => `${i ? 'L' : 'M'}${12 + i * 19.4} ${y}`).join(' ');

function Bar({ i, h }) {
  const scaleY = useT(26.2 + i * 0.07, 27.1 + i * 0.07, 0, 1);
  return (
    <motion.rect
      x={14 + i * 20}
      y={92 - h}
      width="12"
      height={h}
      rx="3"
      style={{ fill: series(1), scaleY, originY: 1, transformBox: 'fill-box' }}
    />
  );
}

function Arc({ i, start, part }) {
  // fatia da rosca como arco; desenha uma depois da outra
  const r = 30;
  const gap = 0.012;
  const a0 = (start + gap) * Math.PI * 2 - Math.PI / 2;
  const a1 = (start + part - gap) * Math.PI * 2 - Math.PI / 2;
  const p = (a) => `${80 + r * Math.cos(a)} ${50 + r * Math.sin(a)}`;
  const d = `M${p(a0)} A${r} ${r} 0 ${part > 0.5 ? 1 : 0} 1 ${p(a1)}`;
  const t = 26.4 + start * 1.3;
  const pathLength = useT(t, t + part * 1.3 + 0.2, 0, 1, EASE.standard);
  return <motion.path d={d} fill="none" strokeWidth="12" style={{ stroke: series(i + 1), pathLength }} />;
}

export function Charts() {
  const [from, to] = TIMELINE.charts;
  const lineA = useT(26.3, 27.8, 0, 1, EASE.standard);
  const lineB = useT(26.2, 27.6, 0, 1, EASE.standard);
  const dot = useT(27.7, 28.1, 0, 1);
  const meter = useT(26.6, 28.0, 0, 0.72);
  const parts = [0.46, 0.28, 0.15, 0.11];
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <Scene from={from} to={to}>
      <Head t={25.4} stamp="04" label="Gráficos" title="Dados que se leem de relance">
        Paleta em ordem fixa validada para daltonismo, marcas finas e tooltip também no teclado.
      </Head>
      <div className="charts">
        <Card t={25.7} className="chart-card">
          <p className="ds-panel__eyebrow">Barras</p>
          <svg viewBox="0 0 160 100" className="chart-svg">
            <path d="M8 92.5H152" className="chart-axis" />
            {BARS.map((h, i) => <Bar key={i} i={i} h={h} />)}
          </svg>
        </Card>
        <Card t={25.82} className="chart-card">
          <p className="ds-panel__eyebrow">Linhas</p>
          <svg viewBox="0 0 160 100" className="chart-svg">
            <path d="M8 28.5H152M8 60.5H152" className="chart-grid" />
            <path d="M8 92.5H152" className="chart-axis" />
            <motion.path d={linePath(LINE_B)} className="chart-line" style={{ stroke: 'var(--ds-color-chart-muted)', pathLength: lineB }} />
            <motion.path d={linePath(LINE_A)} className="chart-line" style={{ stroke: series(1), pathLength: lineA }} />
            <motion.circle cx={12 + 7 * 19.4} cy="14" r="4" style={{ fill: series(1), scale: dot }} />
          </svg>
        </Card>
        <Card t={25.94} className="chart-card">
          <p className="ds-panel__eyebrow">Rosca</p>
          <svg viewBox="0 0 160 100" className="chart-svg">
            {parts.map((part, i) => <Arc key={i} i={i} start={starts[i]} part={part} />)}
          </svg>
        </Card>
        <Card t={26.06} className="chart-card kpi">
          <p className="ds-panel__eyebrow">Receita</p>
          <p className="kpi__value">
            R$ <Count t={26.3} dur={1.6} to={1.3} format={(n) => n.toFixed(1).replace('.', ',')} /> mi
          </p>
          <p className="kpi__delta">
            <Icon name="trending-up" size={16} />+<Count t={26.3} dur={1.6} to={12.4} format={(n) => n.toFixed(1).replace('.', ',')} />%
          </p>
          <span className="kpi__meter">
            <motion.span style={{ scaleX: meter, originX: 0 }} />
          </span>
        </Card>
      </div>
    </Scene>
  );
}

/* ───────── 6 · Números ───────── */

const STATS = [
  [150, 'cores em OKLCH'],
  [94, 'tokens de cor'],
  [19, 'estilos de texto'],
  [126, 'ícones próprios'],
  [16, 'componentes'],
];

export function Numbers() {
  const [from, to] = TIMELINE.numbers;
  return (
    <Scene from={from} to={to} className="numbers">
      <Rise t={30.8} as="p" className="ds-section__head" y={12}>
        <span className="ds-section__stamp">05</span>
        <span>O sistema em números</span>
      </Rise>
      <div className="stats">
        {STATS.map(([value, label], i) => (
          <Rise key={label} t={30.95 + i * 0.1} className="stat" y={30}>
            <p className="stat__value">
              <Count t={31.0 + i * 0.1} dur={1.5} to={value} />
            </p>
            <p className="stat__label">{label}</p>
          </Rise>
        ))}
      </div>
      <Rise t={31.9} as="p" className="numbers__note" y={12}>
        <Icon name="check" size={16} />
        70 de 70 pares de contraste passam no WCAG
      </Rise>
    </Scene>
  );
}

/* ───────── 7 · Encerramento ───────── */

function Word({ t, children }) {
  const enter = useEnter(t, { dur: 1, y: 50 });
  return (
    <motion.span className="outro__word" style={enter}>
      {children}
    </motion.span>
  );
}

export function Outro() {
  const [from, to] = TIMELINE.outro;
  const words = 'Vamos construir com refinamento.'.split(' ');
  return (
    <Scene from={from} to={to} exit={0.8} className="outro">
      <Rise t={34.8} as="p" className="outro__logo" y={12}>
        Órbita
      </Rise>
      <h2 className="outro__title">
        {words.map((w, i) => (
          <Word key={i} t={35.0 + i * 0.12}>
            {w}
          </Word>
        ))}
      </h2>
      <Rise t={35.9} className="outro__actions" y={16}>
        <span className="ds-btn ds-btn--primary ds-btn--lg"><Icon name="zap" />Começar agora</span>
        <span className="ds-btn ds-btn--secondary ds-btn--lg">Ver componentes</span>
      </Rise>
      <Rise t={36.4} as="p" className="outro__url" y={10}>
        orbita-design-system.vercel.app
      </Rise>
    </Scene>
  );
}
