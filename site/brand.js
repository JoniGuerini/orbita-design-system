/**
 * Troca da cor da marca ao vivo (demonstração): os tokens brand.* passam a apontar para outra paleta.
 * Não fica salvo — volta para pêssego ao recarregar.
 *
 * Só o Laranja usa a paleta brand: o Lume claro e o escuro ficam na ardósia, e a troca não muda nada neles.
 *
 * darkText: paleta clara demais para texto no Laranja (amarelos e verdes) — os textos da marca sobem um tom
 *   para passar de 4,5:1 sobre o fundo.
 * swapSeries: a série de gráfico da mesma paleta troca de lugar com a 1ª (a da marca), para não repetir cor.
 *   Só onde a nova ordem passou no validador de daltonismo (ΔE ≥ 8 entre vizinhas, ≥ 15 com visão típica).
 */
import { palettes, tokens } from '../ds/tokens.js';
import { tr } from '../ds/js/i18n.js';

const T = (pt, en, es) => ({ 'pt-BR': pt, en, es });

export const BRANDS = [
  { value: 'brand', label: T('Pêssego', 'Peach', 'Melocotón') },
  { value: 'amber', label: T('Dourado', 'Gold', 'Dorado'), darkText: true, swapSeries: true },
  { value: 'violet', label: T('Violeta', 'Violet', 'Violeta') },
  { value: 'blue', label: T('Azul', 'Blue', 'Azul'), swapSeries: true },
  { value: 'green', label: T('Verde', 'Green', 'Verde'), darkText: true },
  { value: 'pink', label: T('Rosa', 'Pink', 'Rosa') },
];

const brandPalette = palettes.find((p) => p.name === 'brand');
const steps = brandPalette.steps.map((s) => s.step);
const peach = (step) => brandPalette.steps.find((s) => s.step === step).hex;
// A troca redefine --ds-color-brand-*: a bolinha do pêssego usa o tom fixo para não imitar a marca escolhida.
const peachSwatch = peach('400');
const series = Array.from({ length: 8 }, (_, i) => tokens.find((t) => t.name === `color.chart.series.${i + 1}`));
const refVar = (ref) => `var(--ds-${ref.slice(1, -1).replaceAll('.', '-')})`;
const LIGHT_TEXT = '--ds-color-fg-brand: var(--ds-color-brand-800); --ds-color-fg-link: var(--ds-color-brand-800); --ds-color-fg-link-hover: var(--ds-color-brand-900); --ds-color-brand-fg: var(--ds-color-brand-800);';
let active = 'brand';

export const getBrand = () => active;

function brandCss({ value, darkText, swapSeries }) {
  const rules = [`:root { ${steps.map((s) => `--ds-color-brand-${s}: var(--ds-color-${value}-${s});`).join(' ')} }`];
  if (darkText) {
    rules.push(`[data-theme="orange"] { ${LIGHT_TEXT} }`);
  }
  if (swapSeries) {
    // as séries são iguais nos dois temas: a 1ª fica com a cor da série da paleta, e ela com o pêssego original
    const k = series.findIndex((t) => t.modes.dark.ref.startsWith(`{color.${value}.`));
    const first = series[0].modes.dark.ref.match(/\.(\d+)\}$/)[1];
    rules.push(`:root, [data-theme] { ${series[0].cssVar}: ${refVar(series[k].modes.dark.ref)}; ${series[k].cssVar}: ${peach(first)}; }`);
  }
  return rules.join('\n');
}

export function applyBrand(name) {
  active = name;
  const brand = BRANDS.find((b) => b.value === name);
  let style = document.getElementById('ds-brand');
  if (!brand || name === 'brand') {
    if (style) style.remove();
    return;
  }
  if (!style) {
    style = document.createElement('style');
    style.id = 'ds-brand';
    document.head.append(style);
  }
  style.textContent = brandCss(brand);
}

/** Opções do menu no idioma atual. */
export const brandOptions = () =>
  BRANDS.map((b) => ({ ...b, label: tr(b.label), swatch: b.value === 'brand' ? peachSwatch : `var(--ds-color-${b.value}-400)` }));

export const brandLabel = (value) => tr(BRANDS.find((b) => b.value === value)?.label);
