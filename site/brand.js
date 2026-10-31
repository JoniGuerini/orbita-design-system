/**
 * Troca da cor da marca ao vivo (demonstração): os tokens brand.* passam a apontar para outra paleta.
 * Não fica salvo — volta para pêssego ao recarregar.
 */
import { palettes } from '../ds/tokens.js';

export const BRANDS = [
  { value: 'brand', label: 'Pêssego' },
  { value: 'violet', label: 'Violeta' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'pink', label: 'Rosa' },
];

const brandPalette = palettes.find((p) => p.name === 'brand');
const steps = brandPalette.steps.map((s) => s.step);
// A troca redefine --ds-color-brand-*: a bolinha do pêssego usa o tom fixo para não imitar a marca escolhida.
const peachSwatch = brandPalette.steps.find((s) => s.step === '400').hex;
let active = 'brand';

export const getBrand = () => active;

export function applyBrand(name) {
  active = name;
  const root = document.documentElement.style;
  for (const step of steps) {
    const prop = `--ds-color-brand-${step}`;
    if (name === 'brand') root.removeProperty(prop);
    else root.setProperty(prop, `var(--ds-color-${name}-${step})`);
  }
}

export const brandOptions = () =>
  BRANDS.map((b) => ({ ...b, swatch: b.value === 'brand' ? peachSwatch : `var(--ds-color-${b.value}-400)` }));
