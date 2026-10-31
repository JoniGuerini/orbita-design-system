/**
 * Dados de exemplo das páginas de Gráficos — fictícios, estáveis (sem aleatório) e coerentes entre si,
 * para que o mesmo produto apareça igual em todas as páginas.
 */

export const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const HOURS = Array.from({ length: 24 }, (_, h) => `${h}h`);

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
export const channels = {
  categories: MONTHS.slice(0, 6),
  series: [
    { name: 'App', values: [30, 35, 41, 44, 52, 60] },
    { name: 'Loja', values: [40, 42, 38, 50, 55, 52] },
    { name: 'Site', values: [20, 18, 22, 25, 24, 28] },
    { name: 'Parceiros', values: [8, 9, 11, 10, 13, 15] },
  ],
};

/** Formas de pagamento (número de transações no mês). */
export const payments = [
  { name: 'Pix', value: 4210 },
  { name: 'Cartão de crédito', value: 2630 },
  { name: 'Cartão de débito', value: 1290 },
  { name: 'Boleto', value: 610 },
  { name: 'Saldo em conta', value: 320 },
  { name: 'Vale-refeição', value: 140 },
  { name: 'Cripto', value: 60 },
];

/** Entregas por time no trimestre. */
export const teams = {
  categories: ['Pagamentos', 'Cartões', 'Investimentos', 'Seguros', 'Empréstimos', 'Plataforma'],
  values: [48, 41, 33, 27, 19, 14],
};

/** Funil de ativação. */
export const funnel = {
  categories: ['Visitaram', 'Criaram conta', 'Ativaram', 'Primeira compra', 'Recorrentes'],
  values: [12400, 6800, 4100, 2300, 1150],
};

/** Variação do NPS por região contra a meta (pontos). */
export const npsDelta = {
  categories: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
  values: [-6, 4, -2, 9, 5],
};

/** Pedidos por dia da semana × hora. */
export const ordersByHour = (() => {
  const rnd = seeded(11);
  return WEEKDAYS.map((_, d) =>
    HOURS.map((_, h) => {
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

/** Clientes: custo de aquisição × satisfação, por segmento. */
export const customers = (() => {
  const rnd = seeded(5);
  const make = (n, cx, cy, sx, sy, sizeBase) =>
    Array.from({ length: n }, () => ({ x: Math.round(cx + (rnd() - 0.5) * sx), y: Math.round(cy + (rnd() - 0.5) * sy), size: Math.round(sizeBase * (0.4 + rnd())) }));
  return [
    { name: 'Varejo', points: make(18, 60, 52, 70, 46, 120) },
    { name: 'Empresas', points: make(14, 115, 64, 70, 36, 300) },
    { name: 'Autônomos', points: make(12, 38, 38, 40, 40, 60) },
  ];
})();
