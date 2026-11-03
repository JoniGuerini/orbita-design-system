import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent } from 'motion/react';
import { barChart, donutChart, heatmap, lineChart, scatterChart, statTile } from '../../../ds/js/charts.js';
import { channels, customers, hours, months, ordersByHour, payments, revenue, seeded, weekdays } from '../../../site/chart-data.js';
import { EASE, Rise, useSceneStart, useT, useTime } from '../time.jsx';
import { Card, Head } from '../ui.jsx';

/*
 * Os gráficos são os de verdade (ds/js/charts.js). A animação de entrada deles é CSS
 * ([data-animate]); o main.jsx pausa todas as animações e posiciona cada uma pelo relógio,
 * a partir do data-anim-start do gráfico. O tooltip aparece com eventos de ponteiro reais.
 */
function DsChart({ t, build, scrub, className = '' }) {
  const ref = useRef(null);
  const from = useSceneStart();
  const time = useTime();
  const left = useRef(false);

  useEffect(() => {
    const host = ref.current;
    const chart = build(host);
    host.querySelector('.ds-chart')?.setAttribute('data-animate', '');
    return () => {
      chart?.destroy?.();
      host.innerHTML = '';
    };
  }, []);

  useMotionValueEvent(time, 'change', (now) => {
    if (!scrub) return;
    const plot = ref.current?.querySelector('[data-plot]');
    if (!plot) return;
    const [t0, t1, x0, x1, y = 0.5] = scrub;
    if (now >= t0 && now <= t1) {
      const k = EASE.standard((now - t0) / (t1 - t0));
      const r = plot.getBoundingClientRect();
      const x = r.left + (x0 + (x1 - x0) * k) * r.width;
      plot.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: r.top + y * r.height, pointerType: 'mouse' }));
      left.current = false;
    } else if (!left.current) {
      plot.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
      left.current = true;
    }
  });

  return <div ref={ref} className={`v-chart ${className}`} data-anim-start={from + t} />;
}

/* ═════════ 09 · Painel ═════════ */

const trend = (seed, n = 24, base = 50, drift = 1.2) => {
  const rnd = seeded(seed);
  let v = base;
  return Array.from({ length: n }, (_, i) => (v += (rnd() - 0.42) * 8 + drift * (i % 5 === 0 ? 1 : 0)));
};

const STATS = () => [
  { label: 'Receita', value: 174600, format: 'currency-compact', delta: 0.032, deltaLabel: 'vs. mês anterior', trend: trend(3) },
  { label: 'Pedidos', value: 1934, format: 'integer', delta: 0.029, deltaLabel: 'vs. mês anterior', trend: trend(8) },
  { label: 'Ticket médio', value: 90.3, format: 'currency', delta: 0.004, deltaLabel: 'vs. mês anterior', trend: trend(13) },
  { label: 'Conversão', value: 0.033, format: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }, delta: -0.002, deltaLabel: 'vs. mês anterior', trend: trend(21, 24, 50, -0.4) },
];

function Stat({ t, opts }) {
  const p = useT(t + 0.2, t + 1.4, 0, 1, EASE.standard);
  const dot = useT(t + 1.3, t + 1.5, 0, 1);
  return (
    <Rise t={t} y={24} className="v-stat">
      <motion.div style={{ '--p': p, '--dot': dot }} dangerouslySetInnerHTML={{ __html: statTile(opts) }} />
    </Rise>
  );
}

export function Dashboard() {
  return (
    <>
      <Head t={0.2} stamp="09" label="Gráficos" title="Painéis que se leem de relance" compact />
      <div className="dash">
        <div className="dash__stats">
          {STATS().map((opts, i) => (
            <Stat key={opts.label} t={0.45 + i * 0.1} opts={opts} />
          ))}
        </div>
        <Rise t={0.8} y={30} className="dash__line">
          <DsChart
            t={1.1}
            scrub={[3.4, 8.2, 0.04, 0.97, 0.35]}
            build={(el) =>
              lineChart(el, {
                card: true,
                title: 'Receita',
                subtitle: '2026 contra 2025 · em reais',
                categories: months(),
                series: [
                  { name: '2026', values: revenue[2026] },
                  { name: '2025', values: revenue[2025], muted: true },
                ],
                format: 'currency-compact',
                curve: 'smooth',
                area: true,
                height: 196,
              })
            }
          />
        </Rise>
      </div>
    </>
  );
}

/* ═════════ 10 · Formas ═════════ */

export function Charts() {
  const ch = channels();
  return (
    <>
      <Head t={0.2} stamp="09" label="Gráficos" title="Seis formas, uma paleta validada" compact />
      <div className="gallery">
        <Card t={0.4} className="gallery__bars">
          <DsChart
            t={0.6}
            scrub={[4.0, 7.9, 0.1, 0.96, 0.6]}
            build={(el) => barChart(el, { title: 'Vendas por canal', subtitle: '1º semestre · mil unidades', categories: ch.categories, series: ch.series, height: 108 })}
          />
        </Card>
        <Card t={0.52} className="gallery__donut">
          <DsChart t={0.75} build={(el) => donutChart(el, { title: 'Pagamentos', subtitle: 'Outubro', items: payments(), format: 'integer', size: 124, thickness: 16, maxSegments: 5 })} />
        </Card>
        <Card t={0.64} className="gallery__heat">
          <DsChart t={0.9} build={(el) => heatmap(el, { title: 'Pedidos por hora', subtitle: 'Semana típica', rows: weekdays(), columns: hours(), values: ordersByHour, valueLabel: 'pedidos', cellHeight: 13 })} />
        </Card>
        <Card t={0.76} className="gallery__scatter">
          <DsChart
            t={1.0}
            build={(el) => scatterChart(el, { title: 'Clientes', subtitle: 'Custo × satisfação', series: customers(), x: { label: '' }, y: { label: 'Satisfação' }, height: 112 })}
          />
        </Card>
      </div>
    </>
  );
}
