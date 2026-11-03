/**
 * Lume — gráficos.
 *
 *   import { barChart, lineChart, donutChart, heatmap, calendarHeatmap, scatterChart,
 *            sparkline, statTile, meter } from './ds/js/charts.js';
 *
 *   const chart = barChart(document.querySelector('#vendas'), {
 *     title: 'Vendas por mês',
 *     categories: ['Jan', 'Fev', 'Mar'],
 *     series: [{ name: 'Loja', values: [120, 180, 150] }],
 *     format: 'currency',
 *   });
 *   chart.update({ series: [...] });   // mesma API em todos
 *   chart.destroy();
 *
 * Todo gráfico desenha em SVG puro, segue o tema (cores são tokens), tem tooltip no hover e no
 * teclado (setas), legenda que esconde séries sem repintar as outras e uma vista em tabela.
 */
export { barChart } from './charts/bar.js';
export { lineChart } from './charts/line.js';
export { donutChart } from './charts/donut.js';
export { heatmap, calendarHeatmap } from './charts/heatmap.js';
export { scatterChart } from './charts/scatter.js';
export { sparkline, statTile, meter } from './charts/figures.js';
export { formatter, niceTicks, paint } from './charts/core.js';
