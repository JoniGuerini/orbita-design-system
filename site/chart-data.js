/**
 * Dados de exemplo das páginas de Gráficos — fictícios, estáveis (sem aleatório) e coerentes entre si,
 * para que o mesmo produto apareça igual em todas as páginas.
 * O que tem texto é função: devolve os nomes no idioma atual (chame na renderização).
 */

import { locale, dateFormat } from '../ds/js/i18n.js';
import { L } from './i18n.js';

const cap = (s) => s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1);

/** Jan, Fev… / Jan, Feb… / Ene, Feb… */
export const months = () => Array.from({ length: 12 }, (_, i) => cap(dateFormat({ month: 'short' }).format(new Date(2026, i, 15)).replace('.', '')));
/** Seg… Dom (a semana começa na segunda). */
export const weekdays = () => Array.from({ length: 7 }, (_, i) => cap(dateFormat({ weekday: 'short' }).format(new Date(2026, 10, 2 + i)).replace('.', '')));
export const hours = () => Array.from({ length: 24 }, (_, h) => L(`${h}h`, `${h}:00`, `${h} h`));

/** Gerador pseudoaleatório com semente: os gráficos não mudam a cada visita. */
export function seeded(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Receita mensal (R$) — 2026 e 2025. */
export const revenue = {
  2026: [82, 91, 88, 104, 112, 98, 120, 131, 126, 140, 152, 149].map((v) => v * 1000),
  2025: [70, 74, 79, 81, 86, 84, 92, 97, 95, 103, 110, 118].map((v) => v * 1000),
};

/** Usuários ativos por mês. */
export const activeUsers = {
  2026: [12.1, 13.8, 13.2, 17.9, 20.6, 23.8, 23.1, 26.9, 29.8, 29.2, 33.6, 38.2].map((v) => Math.round(v * 1000)),
  2025: [10.2, 10.9, 11.1, 12.8, 14.1, 15.9, 16.8, 17.7, 18.9, 20.8, 22.1, 24.0].map((v) => Math.round(v * 1000)),
};

/** Vendas por canal (mil unidades), primeiro semestre. */
export const channels = () => ({
  categories: months().slice(0, 6),
  series: [
    { name: 'App', values: [30, 35, 41, 44, 52, 60] },
    { name: L('Loja', 'Store', 'Tienda'), values: [40, 42, 38, 50, 55, 52] },
    { name: L('Site', 'Website', 'Sitio web'), values: [20, 18, 22, 25, 24, 28] },
    { name: L('Parceiros', 'Partners', 'Socios'), values: [8, 9, 11, 10, 13, 15] },
  ],
});

/** Formas de pagamento (número de transações no mês). */
export const payments = () => [
  { name: 'Pix', value: 4210 },
  { name: L('Cartão de crédito', 'Credit card', 'Tarjeta de crédito'), value: 2630 },
  { name: L('Cartão de débito', 'Debit card', 'Tarjeta de débito'), value: 1290 },
  { name: 'Boleto', value: 610 },
  { name: L('Saldo em conta', 'Account balance', 'Saldo en cuenta'), value: 320 },
  { name: L('Vale-refeição', 'Meal voucher', 'Vale de comida'), value: 140 },
  { name: L('Cripto', 'Crypto', 'Cripto'), value: 60 },
];

/** Entregas por time no trimestre. */
export const teams = () => ({
  categories: [L('Pagamentos', 'Payments', 'Pagos'), L('Cartões', 'Cards', 'Tarjetas'), L('Investimentos', 'Investments', 'Inversiones'), L('Seguros', 'Insurance', 'Seguros'), L('Empréstimos', 'Loans', 'Préstamos'), L('Plataforma', 'Platform', 'Plataforma')],
  values: [48, 41, 33, 27, 19, 14],
});

/** Funil de ativação. */
export const funnel = () => ({
  categories: [L('Visitaram', 'Visited', 'Visitaron'), L('Criaram conta', 'Signed up', 'Crearon cuenta'), L('Ativaram', 'Activated', 'Activaron'), L('Primeira compra', 'First purchase', 'Primera compra'), L('Recorrentes', 'Returning', 'Recurrentes')],
  values: [12400, 6800, 4100, 2300, 1150],
});

/** Variação do NPS por região contra a meta (pontos). */
export const npsDelta = () => ({
  categories: [L('Norte', 'North', 'Norte'), L('Nordeste', 'Northeast', 'Noreste'), L('Centro-Oeste', 'Center-West', 'Centro-Oeste'), L('Sudeste', 'Southeast', 'Sureste'), L('Sul', 'South', 'Sur')],
  values: [-6, 4, -2, 9, 5],
});

/** Pedidos por dia da semana × hora. */
export const ordersByHour = (() => {
  const rnd = seeded(11);
  return Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const curve = Math.max(0, Math.sin(((h - 6) / 24) * Math.PI * 2));
      const lunch = h >= 11 && h <= 13 ? 14 : 0;
      const dinner = h >= 19 && h <= 21 ? 18 : 0;
      const weekend = d >= 5 ? (h >= 10 ? 10 : -6) : 0;
      return Math.max(0, Math.round(curve * 34 + lunch + dinner + weekend + rnd() * 8 - (h < 6 ? 10 : 0)));
    }),
  );
})();

/** Atividade diária de um ano (começando num domingo). */
export const yearActivity = (() => {
  const rnd = seeded(3);
  return Array.from({ length: 364 }, (_, i) => {
    const weekday = i % 7;
    const weekend = weekday === 0 || weekday === 6;
    const season = 0.6 + 0.4 * Math.sin((i / 364) * Math.PI * 2 - 1);
    if (rnd() < (weekend ? 0.7 : 0.18)) return 0;
    return Math.round(rnd() * 9 * season + (weekend ? 0 : 2));
  });
})();
export const YEAR_START = '2025-11-02';

/** Clientes: custo de aquisição × satisfação, por segmento (pontos fixos; nomes no idioma atual). */
const CUSTOMER_POINTS = (() => {
  const rnd = seeded(5);
  const make = (n, cx, cy, sx, sy, sizeBase) =>
    Array.from({ length: n }, () => ({ x: Math.round(cx + (rnd() - 0.5) * sx), y: Math.round(cy + (rnd() - 0.5) * sy), size: Math.round(sizeBase * (0.4 + rnd())) }));
  return [make(18, 60, 52, 70, 46, 120), make(14, 115, 64, 70, 36, 300), make(12, 38, 38, 40, 40, 60)];
})();
export const customers = () => [
  { name: L('Varejo', 'Retail', 'Minorista'), points: CUSTOMER_POINTS[0] },
  { name: L('Empresas', 'Businesses', 'Empresas'), points: CUSTOMER_POINTS[1] },
  { name: L('Autônomos', 'Freelancers', 'Autónomos'), points: CUSTOMER_POINTS[2] },
];
