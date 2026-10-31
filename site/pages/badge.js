import { icon } from '../../ds/icons/icons.js';
import { tokens, contrast } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/badge.css'];

/* ───────── Dados ───────── */

const TONES = [
  ['neutral', 'Neutro', 'Rascunho', 'Estado sem urgência: rascunho, arquivado, planejado.'],
  ['brand', 'Marca', 'Novo', 'Raro. Algo recém-adicionado dentro de uma lista — nunca como chamada.'],
  ['success', 'Sucesso', 'Pronto', 'Concluído, ativo, aprovado.'],
  ['warning', 'Aviso', 'Em revisão', 'Precisa de atenção, mas não bloqueia.'],
  ['danger', 'Perigo', 'Falhou', 'Erro ou bloqueio que pede ação.'],
  ['info', 'Informação', 'Beta', 'Contexto neutro: beta, em análise.'],
];

const byName = new Map(tokens.map((t) => [t.name, t]));

/* contraste: usa as verificações do build; o neutro é calculado aqui (fundo translúcido sobre o canvas) */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function ratio(fgName, bgName, mode) {
  const canvas = hexToRgb(byName.get('color.bg.canvas').modes[mode].value).rgb;
  const solid = (name) => {
    const c = hexToRgb(byName.get(name).modes[mode].value);
    return c.rgb.map((v, i) => Math.round(v * c.a + canvas[i] * (1 - c.a)));
  };
  const [hi, lo] = [lum(solid(fgName)), lum(solid(bgName))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function toneRatio(tone, mode) {
  if (tone === 'neutral') return ratio('color.fg.muted', 'color.bg.selected', mode);
  return contrast.find((c) => c.fg === `color.${tone}.fg` && c.bg === `color.${tone}.subtle` && c.mode === mode)?.ratio ?? ratio(`color.${tone}.fg`, `color.${tone}.subtle`, mode);
}
const fmtRatio = (r) => `${r.toFixed(2).replace('.', ',')}:1`;

/* ───────── Montagem do badge ───────── */

function badge({ tone = 'neutral', size = 'md', dot = 'no', kind = 'label', label = 'Pronto' }) {
  const cls = ['ds-badge', tone !== 'neutral' && `ds-badge--${tone}`, size === 'sm' && 'ds-badge--sm', kind === 'count' && 'ds-badge--count'].filter(Boolean).join(' ');
  const text = kind === 'count' ? countLabel(label) : escapeHtml(label || 'Badge');
  return `<span class="${cls}">${dot === 'yes' && kind !== 'count' ? '<span class="ds-badge__dot"></span>' : ''}${text}</span>`;
}

function countLabel(value) {
  const n = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  if (!Number.isFinite(n)) return '12';
  return n > 99 ? '99+' : String(n);
}

function badgeCode(state) {
  const cls = ['ds-badge', state.tone !== 'neutral' && `ds-badge--${state.tone}`, state.size === 'sm' && 'ds-badge--sm', state.kind === 'count' && 'ds-badge--count'].filter(Boolean).join(' ');
  const text = state.kind === 'count' ? countLabel(state.label) : state.label || 'Badge';
  if (state.dot === 'yes' && state.kind !== 'count') return `<span class="${cls}">\n  <span class="ds-badge__dot"></span>\n  ${text}\n</span>`;
  return `<span class="${cls}">${text}</span>`;
}

/* ───────── Página ───────── */

export default function renderBadge(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Badge</h1>
        <p class="doc-header__lead">Rótulo curto de status ou de contagem. Pequeno, discreto e sempre com significado — nunca enfeite.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tons</dt><dd class="doc-stat__value">${TONES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">altura (md / sm)</dt><dd class="doc-stat__value">24/20</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">interativo</dt><dd class="doc-stat__value">não</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['tons', 'Tons'],
        ['tamanhos', 'Tamanhos'],
        ['contagem', 'Contagem'],
        ['onde', 'Onde usar'],
        ['acessibilidade', 'Acessibilidade'],
        ['tokens', 'Tokens'],
        ['uso', 'Uso'],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">Escolha o tom, o tamanho e o tipo. Na contagem, o rótulo vira número (acima de 99, “99+”).</p>
        </div>
      </header>
      ${playgroundMarkup('badge')}
    </section>

    <section class="doc-section" id="tons" aria-labelledby="tons-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tons-title">Tons</h2>
          <p class="doc-section__desc">O tom diz o tipo de status. Fundo suave, texto forte e contorno fino — legível nos dois temas, sem gritar.</p>
        </div>
      </header>
      <div class="cd-grid bd-tones">
        ${TONES.map(
          ([tone, name, sample, text]) => `<article class="cd-example">
            <div class="cd-example__preview" inert>
              ${badge({ tone, label: sample })}
              ${badge({ tone, label: sample, dot: 'yes' })}
              ${badge({ tone, label: sample, size: 'sm' })}
            </div>
            <div class="cd-example__body">
              <p class="cd-example__name">${name}<code>${tone === 'neutral' ? 'ds-badge' : `ds-badge--${tone}`}</code></p>
              <p class="cd-example__text">${text}</p>
              <p class="bd-ratio">Contraste ${fmtRatio(toneRatio(tone, 'dark'))} escuro · ${fmtRatio(toneRatio(tone, 'light'))} claro</p>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">Médio ao lado de texto comum; pequeno em tabelas, listas densas e cabeçalhos de card.</p>
        </div>
      </header>
      <div class="bd-sizes">
        ${[
          ['md', 'Médio', '24 px', 'label-sm · 13 px', 'padrão'],
          ['sm', 'Pequeno', '20 px', 'caption · 12 px', 'ds-badge--sm'],
        ]
          .map(
            ([size, name, h, text, cls]) => `<article class="cd-example">
              <div class="cd-example__preview" inert>
                ${badge({ tone: 'success', size, label: 'Pronto', dot: 'yes' })}
                ${badge({ tone: 'warning', size, label: 'Em revisão' })}
                ${badge({ size, kind: 'count', label: '12' })}
              </div>
              <div class="cd-example__body">
                <p class="cd-example__name">${name}<code>${cls}</code></p>
                <p class="cd-example__text">Altura ${h} · texto ${text}</p>
              </div>
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="contagem" aria-labelledby="contagem-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="contagem-title">Contagem</h2>
          <p class="doc-section__desc"><code class="ds-inline-code">ds-badge--count</code> centraliza o número e mantém a largura mínima de um círculo. Zero não aparece; acima de 99, mostre “99+”.</p>
        </div>
      </header>
      <div class="bd-count" inert>
        <ul class="bd-count__list" role="list">
          ${[
            ['inbox', 'Caixa de entrada', 12, 'brand'],
            ['message-square', 'Comentários', 128, 'neutral'],
            ['check-circle', 'Aprovações', 3, 'neutral'],
            ['folder', 'Arquivados', 0, 'neutral'],
          ]
            .map(
              ([ic, label, n, tone]) => `<li class="bd-count__item">
                ${icon(ic, { size: 18 })}<span class="bd-count__label">${label}</span>
                ${n > 0 ? badge({ tone, kind: 'count', size: 'sm', label: String(n) }) : '<span class="bd-count__zero">sem badge</span>'}
              </li>`,
            )
            .join('')}
        </ul>
        <div class="bd-count__rules">
          <p class="bd-count__rule"><span>12</span>número exato até 99</p>
          <p class="bd-count__rule"><span>99+</span>acima de 99</p>
          <p class="bd-count__rule"><span>—</span>zero: sem badge</p>
        </div>
      </div>
    </section>

    <section class="doc-section" id="onde" aria-labelledby="onde-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="onde-title">Onde usar</h2>
          <p class="doc-section__desc">Badge acompanha algo — uma linha, um título, um item. Ele nunca está sozinho na tela.</p>
        </div>
      </header>
      <div class="bd-contexts" inert>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__row"><span>Botão</span>${badge({ tone: 'success', size: 'sm', label: 'Pronto' })}</div>
            <div class="bd-ctx__row"><span>Menu</span>${badge({ tone: 'warning', size: 'sm', label: 'Em revisão' })}</div>
            <div class="bd-ctx__row"><span>Modal</span>${badge({ size: 'sm', label: 'Planejado' })}</div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Linha de lista ou tabela</p><p class="cd-example__text">O status de cada item, sempre na mesma coluna.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__card">
              <p class="bd-ctx__title">Integração com o Figma ${badge({ tone: 'info', size: 'sm', label: 'Beta' })}</p>
              <p class="bd-ctx__text">Sincroniza tokens e componentes com a biblioteca.</p>
            </div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Ao lado de um título</p><p class="cd-example__text">Qualifica o que está escrito: beta, em teste.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview bd-ctx">
            <div class="bd-ctx__row bd-ctx__row--nav">${icon('inbox', { size: 18 })}<span>Revisões</span>${badge({ kind: 'count', size: 'sm', label: '3' })}</div>
            <div class="bd-ctx__row bd-ctx__row--nav">${icon('bell', { size: 18 })}<span>Menções</span>${badge({ tone: 'brand', kind: 'count', size: 'sm', label: '128' })}</div>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Contagem num item</p><p class="cd-example__text">Quanto há para ver, na ponta direita.</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Badge é texto. Trate como texto.</p>
        </div>
      </header>
      ${a11yList([
        ['Cor nunca sozinha', 'O status está escrito (“Em revisão”). O ponto e o tom só reforçam.'],
        ['Contraste verificado', `O texto de cada tom passa de 4,5:1 sobre o próprio fundo — sucesso: ${fmtRatio(toneRatio('success', 'dark'))} no escuro, ${fmtRatio(toneRatio('success', 'light'))} no claro.`],
        ['Não é interativo', 'Badge não recebe clique nem foco. Se precisa filtrar ou abrir algo, use chip, link ou botão.'],
        ['Contagem com contexto', 'Um “12” solto não diz nada ao leitor de tela. Complete com texto oculto: “12 não lidas”.'],
        ['Mudou? Anuncie', 'Quando o status muda sem recarregar, coloque a mensagem numa região <code class="ds-inline-code">aria-live="polite"</code>.'],
        ['Curto de verdade', 'Uma ou duas palavras. Frase inteira vira texto comum, não badge.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Cada tom usa o trio subtle / fg / border do seu status. Aqui, o neutro e o de sucesso como exemplo.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.selected', 'Fundo (neutro)'],
        ['color.fg.muted', 'Texto (neutro)'],
        ['color.border.subtle', 'Contorno (neutro)'],
        ['color.success.subtle', 'Fundo (sucesso)'],
        ['color.success.fg', 'Texto (sucesso)'],
        ['color.success.border', 'Contorno (sucesso)'],
        ['color.brand.subtle', 'Fundo (marca)'],
        ['color.brand.fg', 'Texto (marca)'],
        ['text.label-sm', 'Texto (médio)'],
        ['text.caption', 'Texto (pequeno)'],
        ['radius.full', 'Forma de pílula'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Badge é informação. Se não informa nada, não é badge.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: status e contagens</p>
          <div class="bd-usage__preview" inert>${badge({ tone: 'success', label: 'Pronto' })}${badge({ tone: 'warning', label: 'Em revisão' })}${badge({ kind: 'count', label: '12' })}</div>
          <p class="usage-card__text">Diz o estado de algo ou quanto há dele, numa ou duas palavras.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: badge decorativo</p>
          <div class="bd-usage__preview" inert><span class="ds-badge ds-badge--brand"><span class="ds-badge__dot"></span>Versão 0.1 · veja as novidades</span></div>
          <p class="usage-card__text">Badge não é chamada nem enfeite de herói. Novidade se escreve no texto ou vira um link de verdade.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Um por linha</p>
          <p class="usage-card__text">Mais de um badge no mesmo item compete pela atenção. Escolha o status que importa agora.</p>
          <pre class="ds-code ds-code--sm"><code>&lt;span class="ds-badge ds-badge--success"&gt;
  Pronto
&lt;/span&gt;</code></pre>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'badge',
    controls: [
      { id: 'tone', label: 'Tom', value: 'success', options: TONES.map(([value, label]) => ({ value, label })) },
      { id: 'size', label: 'Tamanho', value: 'md', options: [{ value: 'md', label: 'Médio' }, { value: 'sm', label: 'Pequeno' }] },
      { id: 'dot', label: 'Ponto', value: 'yes', options: [{ value: 'no', label: 'Sem' }, { value: 'yes', label: 'Com' }] },
      { id: 'kind', label: 'Tipo', value: 'label', options: [{ value: 'label', label: 'Rótulo' }, { value: 'count', label: 'Contagem' }] },
    ],
    text: { id: 'label', label: 'Texto', value: 'Pronto' },
    render: (state) => badge(state),
    code: badgeCode,
  });
  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
