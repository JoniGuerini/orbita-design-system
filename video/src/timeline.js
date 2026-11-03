/* Ordem e duração das cenas (segundos). Cada cena conta o próprio tempo a partir de 0. */
const SCENES = [
  ['intro', 4.6],
  ['colors', 5.8],
  ['type', 5.2],
  ['icons', 7.8],
  ['components', 9.6],
  ['forms', 8.0],
  ['overlays', 8.4],
  ['table', 7.6],
  ['chat', 9.0],
  ['dashboard', 9.0],
  ['charts', 8.4],
  ['numbers', 4.6],
  ['outro', 5.6],
];

export const TIMELINE = {};
let at = 0;
for (const [name, length] of SCENES) {
  TIMELINE[name] = [at, at + length];
  at += length;
}
export const DURATION = at;
