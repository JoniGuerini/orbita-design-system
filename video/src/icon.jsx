import { icon } from '../../ds/icons/icons.js';

/** Os ícones reais do Órbita. `display: contents` para não criar uma caixa a mais no flex. */
export function Icon({ name, size = 20, className }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: icon(name, { size, className }) }} />;
}
