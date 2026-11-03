import { motion, useTransform } from 'motion/react';
import { EASE, Rise, useT, useTime } from '../time.jsx';
import { DrawIcon, Head, ICON_NAMES } from '../ui.jsx';

/* Ícones: um espécime grande se desenhando sobre o grid de 24 e a parede com os 126. */

const SPECIMENS = [
  ['megaphone', 0.7],
  ['palette', 2.9],
  ['layers', 5.1],
];
const HOLD = 2.2;

function Specimen({ name, t }) {
  const time = useTime();
  const progress = useTransform(time, [t, t + 1.3], [0, 1], { clamp: true, ease: EASE.standard });
  const visible = useTransform(time, [t - 0.01, t, t + HOLD - 0.3, t + HOLD], [0, 1, 1, 0], { clamp: true });
  const label = useTransform(time, [t + 0.2, t + 0.5, t + HOLD - 0.3, t + HOLD], [0, 1, 1, 0], { clamp: true });
  return (
    <>
      <motion.div className="specimen__icon" style={{ opacity: visible }}>
        <DrawIcon name={name} size={300} strokeWidth={1.5} progress={progress} />
      </motion.div>
      <motion.p className="specimen__name" style={{ opacity: label }}>
        {name}
      </motion.p>
    </>
  );
}

function GridLines() {
  const lines = [];
  for (let i = 0; i <= 24; i++) {
    const strong = i === 0 || i === 24 || i === 12;
    lines.push(<path key={`v${i}`} d={`M${i} 0V24`} className={strong ? 'grid24__strong' : ''} />);
    lines.push(<path key={`h${i}`} d={`M0 ${i}H24`} className={strong ? 'grid24__strong' : ''} />);
  }
  return (
    <svg className="grid24" viewBox="-0.5 -0.5 25 25" aria-hidden="true">
      {lines}
      {/* linhas-guia: círculo e quadrado de base */}
      <circle cx="12" cy="12" r="10" className="grid24__key" />
      <rect x="3" y="3" width="18" height="18" rx="2" className="grid24__key" />
    </svg>
  );
}

const COLS = 14;

function WallIcon({ name, i }) {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const t = 0.9 + (r + c) * 0.06;
  const progress = useT(t, t + 0.9, 0, 1, EASE.standard);
  return (
    <span className="wall__cell">
      <DrawIcon name={name} size={24} progress={progress} />
    </span>
  );
}

export function Icons() {
  const enter = useT(0.3, 1.1, 0, 1, EASE.standard);
  const rows = Math.ceil(ICON_NAMES.length / COLS);
  const pan = useT(3.0, 7.6, 0, -(rows * 48 - 384), EASE.standard);
  return (
    <>
      <Rise t={0.25} className="specimen" y={30} scale={0.97}>
        <motion.div style={{ opacity: enter }}>
          <GridLines />
        </motion.div>
        {SPECIMENS.map(([name, t]) => (
          <Specimen key={name} name={name} t={t} />
        ))}
      </Rise>
      <div className="icons__right">
        <Head t={0.2} stamp="03" label="Ícones" title={`${ICON_NAMES.length} ícones desenhados do zero`}>
          Grid de 24, traço de 1,5 px e pontas redondas. Nenhum veio de biblioteca de terceiros.
        </Head>
        <div className="wall">
          <motion.div className="wall__grid" style={{ y: pan }}>
            {ICON_NAMES.map((name, i) => (
              <WallIcon key={name} name={name} i={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
