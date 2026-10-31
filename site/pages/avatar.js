import { icon } from '../../ds/icons/icons.js';
import { palettes, tokens } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/avatar.css'];

/* ───────── Dados ───────── */

const SIZES = [
  ['xs', 24, 'Listas densas, tabelas'],
  ['sm', 32, 'Comentários, menções'],
  ['md', 40, 'Padrão'],
  ['lg', 48, 'Cabeçalhos de card'],
  ['xl', 64, 'Perfil, convite'],
];

const TONES = [
  ['sand', 'Areia'],
  ['clay', 'Argila'],
  ['ochre', 'Ocre'],
  ['slate', 'Ardósia'],
  ['green', 'Verde'],
  ['teal', 'Verde-azulado'],
  ['blue', 'Azul'],
  ['violet', 'Violeta'],
  ['pink', 'Rosa'],
];

const STATUS = [
  ['online', 'Online', 'color.success.solid'],
  ['away', 'Ausente', 'color.warning.solid'],
  ['busy', 'Ocupado', 'color.danger.solid'],
  ['offline', 'Offline', 'color.fg.disabled'],
];

const PEOPLE = ['Marina Duarte', 'Caio Ramos', 'Lia Nakamura', 'Otávio Prado', 'Bruna Sá', 'Rafael Couto', 'Teresa Lins'];

/** Retrato geométrico gerado aqui mesmo (SVG em data URI) — nenhuma imagem externa. */
const portrait = (bg, skin, shirt) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><circle cx="32" cy="25" r="11" fill="${skin}"/><path d="M11 64c1.5-13 10-20 21-20s19.5 7 21 20z" fill="${shirt}"/></svg>`,
  )}`;
const PHOTOS = [portrait('#c9b08f', '#f1dcc8', '#4a4744'), portrait('#8fa3ad', '#e5c3a6', '#3d3b38'), portrait('#c98f73', '#f3e3d3', '#5f4a3c')];
const BROKEN = 'data:image/png;base64,AAAA';

const initials = (name) => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words.at(-1)[0] : '';
  return (first + last).toLocaleUpperCase('pt-BR');
};

/** Tom estável por pessoa: o mesmo nome sempre cai no mesmo tom. */
export const toneFor = (name) => {
  let h = 0;
  for (const ch of String(name).normalize('NFD')) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return TONES[h % TONES.length][0];
};

/* ───────── Contraste dos tons (calculado com os valores reais) ───────── */

const hexOf = (p, s) => palettes.find((x) => x.name === p).steps.find((x) => x.step === s).hex;
const raised = tokens.find((t) => t.name === 'color.bg.raised').modes;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, t) => a.map((v, i) => Math.round(v * t + b[i] * (1 - t)));

const toneContrast = TONES.map(([p]) => {
  const t = rgb(hexOf(p, '400'));
  return {
    dark: ratio(rgb(hexOf(p, '200')), mix(t, rgb(raised.dark.value), 0.24)),
    light: ratio(rgb(hexOf(p, '800')), mix(t, rgb(raised.light.value), 0.24)),
  };
});
const minContrast = Math.min(...toneContrast.flatMap((c) => [c.dark, c.light]));
const fmt = (n) => n.toFixed(2).replace('.', ',');

/* ───────── Montagem ───────── */

function avatarClasses(s) {
  const tone = s.tone === 'auto' ? toneFor(s.name) : s.tone;
  return ['ds-avatar', s.size && s.size !== 'md' && `ds-avatar--${s.size}`, tone && tone !== 'neutral' && s.content !== 'icon' && `ds-avatar--${tone}`, s.shape === 'square' && 'ds-avatar--square']
    .filter(Boolean)
    .join(' ');
}

const statusLabel = (s) => STATUS.find(([id]) => id === s.status)?.[1];

function avatar(s, { decorative = false, photo = PHOTOS[0], tooltip = false } = {}) {
  const name = s.name || 'Sem nome';
  const px = SIZES.find(([id]) => id === (s.size || 'md'))[1];
  const label = statusLabel(s) ? `${name}, ${statusLabel(s).toLowerCase()}` : name;
  const a11y = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${escapeHtml(label)}"`;
  const tip = tooltip ? ` data-ds-tooltip="${escapeHtml(name)}" data-ds-tooltip-placement="bottom"` : '';
  let inner;
  if (s.content === 'icon') inner = icon('user', { size: Math.round(px / 2) });
  else inner = `<span aria-hidden="true">${escapeHtml(initials(name))}</span>`;
  if (s.content === 'image' || s.content === 'broken') inner += `<img src="${s.content === 'broken' ? BROKEN : photo}" alt="" onerror="this.remove()">`;
  const status = s.status && s.status !== 'none' ? `<span class="ds-avatar__status ds-avatar__status--${s.status}" aria-hidden="true"></span>` : '';
  return `<span class="${avatarClasses(s)}" ${a11y}${tip}>${inner}${status}</span>`;
}

function avatarCode(s) {
  const name = s.name || 'Sem nome';
  const label = statusLabel(s) ? `${name}, ${statusLabel(s).toLowerCase()}` : name;
  const lines = [`<span class="${avatarClasses(s)}" role="img" aria-label="${label}">`];
  if (s.content === 'icon') lines.push('  <ds-icon name="user"></ds-icon>');
  else lines.push(`  <span aria-hidden="true">${initials(name)}</span>`);
  if (s.content === 'image' || s.content === 'broken') lines.push('  <img src="/fotos/marina.jpg" alt="" onerror="this.remove()">');
  if (s.status && s.status !== 'none') lines.push(`  <span class="ds-avatar__status ds-avatar__status--${s.status}" aria-hidden="true"></span>`);
  lines.push('</span>');
  return lines.join('\n');
}

const CONTENTS = [
  ['image', 'Imagem', 'A foto da pessoa, recortada no círculo. As iniciais ficam por baixo, prontas para o caso de a imagem falhar.'],
  ['initials', 'Iniciais', 'Primeira letra do primeiro e do último nome, num tom estável derivado do nome.'],
  ['icon', 'Ícone', 'Sem nome nem foto: convidados, contas genéricas, lugares vazios.'],
  ['broken', 'Imagem que falhou', 'O onerror remove a imagem e as iniciais aparecem — nada de ícone quebrado.'],
];

/* ───────── Página ───────── */

export default function renderAvatar(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Avatar</h1>
        <p class="doc-header__lead">Representa uma pessoa ou conta. Foto quando existe, iniciais num tom estável quando não — e sempre com um nome por trás.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">${SIZES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tons</dt><dd class="doc-stat__value">${TONES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">status</dt><dd class="doc-stat__value">${STATUS.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">contraste mínimo</dt><dd class="doc-stat__value">${fmt(minContrast)}:1</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['tamanhos', 'Tamanhos'],
        ['tipos-de-conteudo', 'Conteúdo'],
        ['tons', 'Tons'],
        ['status', 'Status'],
        ['grupo', 'Grupo'],
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
          <p class="doc-section__desc">Troque o nome para ver as iniciais e o tom mudarem. “Imagem que falhou” mostra o fallback em ação.</p>
        </div>
      </header>
      ${playgroundMarkup('avatar')}
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">Cinco tamanhos. As iniciais e o status acompanham a proporção sozinhos.</p>
        </div>
      </header>
      <div class="av-sizes">
        ${SIZES.map(
          ([id, px, use]) => `<div class="av-size">
            <div class="av-size__preview">${avatar({ name: 'Marina Duarte', size: id, tone: 'auto', content: 'initials', status: id === 'md' ? 'online' : 'none' })}</div>
            <p class="av-size__name">${id}<span>${px} px</span></p>
            <p class="av-size__use">${use}</p>
            <code class="ds-inline-code">${id === 'md' ? 'ds-avatar' : `ds-avatar--${id}`}</code>
          </div>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="tipos-de-conteudo" aria-labelledby="conteudo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="conteudo-title">Conteúdo</h2>
          <p class="doc-section__desc">A ordem de preferência é sempre a mesma: imagem, iniciais, ícone.</p>
        </div>
      </header>
      <div class="cd-grid">
        ${CONTENTS.map(
          ([id, name, text], i) => `<article class="cd-example">
            <div class="cd-example__preview">${avatar({ name: 'Caio Ramos', size: 'xl', tone: 'auto', content: id }, { photo: PHOTOS[i % PHOTOS.length] })}</div>
            <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="tons" aria-labelledby="tons-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tons-title">Tons</h2>
          <p class="doc-section__desc">Nove tons das paletas de apoio, levemente tingidos sobre a superfície. O tom vem do nome: a mesma pessoa tem sempre a mesma cor, em qualquer tela.</p>
        </div>
      </header>
      <div class="av-tones">
        <div class="av-tones__grid">
          ${[['neutral', 'Neutro'], ...TONES]
            .map(
              ([id, label]) => `<div class="av-tone">
                ${avatar({ name: label, size: 'lg', tone: id, content: 'initials' }, { decorative: true })}
                <p class="av-tone__name">${label}</p>
                <code class="av-tone__class">${id === 'neutral' ? 'padrão' : `--${id}`}</code>
              </div>`,
            )
            .join('')}
        </div>
        <div class="av-tones__try">
          <label class="ds-form-field__label av-tones__label" for="av-name">Teste um nome</label>
          <div class="av-tones__row">
            <span data-tone-preview>${avatar({ name: 'Lia Nakamura', size: 'lg', tone: 'auto', content: 'initials' })}</span>
            <div class="ds-field av-tones__field"><input class="ds-field__input" id="av-name" type="text" value="Lia Nakamura" data-tone-input spellcheck="false"></div>
          </div>
          <p class="av-tones__result" data-tone-result>Tom: ${TONES.find(([id]) => id === toneFor('Lia Nakamura'))[1]}</p>
          <p class="av-tones__contrast">${icon('check-circle', { size: 16 })}Contraste das iniciais entre ${fmt(minContrast)}:1 e ${fmt(Math.max(...toneContrast.flatMap((c) => [c.dark, c.light])))}:1 nos dois temas.</p>
        </div>
      </div>
      <div class="av-code">${codeBlock("// mesmo nome, mesmo tom\nfunction toneFor(name) {\n  let h = 0;\n  for (const ch of name.normalize('NFD')) h = (h * 31 + ch.codePointAt(0)) >>> 0;\n  return TONES[h % TONES.length];\n}")}</div>
    </section>

    <section class="doc-section" id="status" aria-labelledby="status-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="status-title">Status</h2>
          <p class="doc-section__desc">Um ponto no canto, com um anel na cor do fundo para separar. Status não é só cor: diga também no nome acessível ou no texto ao lado.</p>
        </div>
      </header>
      <div class="av-status">
        ${STATUS.map(
          ([id, label]) => `<div class="av-status__item">
            ${avatar({ name: 'Otávio Prado', size: 'lg', tone: 'auto', content: 'image', status: id }, { photo: PHOTOS[1] })}
            <div><p class="av-status__name">${label}</p><code class="av-status__class">ds-avatar__status--${id}</code></div>
          </div>`,
        ).join('')}
      </div>
      <p class="av-note">${icon('info', { size: 16 })}<span>Sobre outra superfície, ajuste o anel com <code class="ds-inline-code">--ds-avatar-ring</code> (padrão: o fundo do canvas).</span></p>
    </section>

    <section class="doc-section" id="grupo" aria-labelledby="grupo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grupo-title">Grupo</h2>
          <p class="doc-section__desc">Avatares sobrepostos para mostrar quem participa. Até quatro rostos e um “+N” para o resto. Passe o mouse para ver os nomes.</p>
        </div>
      </header>
      <div class="av-groups">
        ${['sm', 'md', 'lg']
          .map(
            (size) => `<div class="av-group-row">
              <div class="ds-avatar-group" role="group" aria-label="${PEOPLE.length} participantes">
                ${PEOPLE.slice(0, 4)
                  .map((name, i) => avatar({ name, size, tone: 'auto', content: i === 1 ? 'image' : 'initials' }, { photo: PHOTOS[2], tooltip: true }))
                  .join('')}
                <span class="ds-avatar ds-avatar--more${size === 'md' ? '' : ` ds-avatar--${size}`}" role="img" aria-label="Mais ${PEOPLE.length - 4} pessoas" data-ds-tooltip="${PEOPLE.slice(4).join(', ')}" data-ds-tooltip-placement="bottom">+${PEOPLE.length - 4}</span>
              </div>
              <code class="ds-inline-code">${size === 'md' ? 'ds-avatar' : `ds-avatar--${size}`}</code>
            </div>`,
          )
          .join('')}
      </div>
      <div class="av-code">${codeBlock('<div class="ds-avatar-group" role="group" aria-label="7 participantes">\n  <span class="ds-avatar ds-avatar--sm ds-avatar--violet" role="img" aria-label="Marina Duarte">\n    <span aria-hidden="true">MD</span>\n  </span>\n  …\n  <span class="ds-avatar ds-avatar--sm ds-avatar--more" role="img" aria-label="Mais 3 pessoas">+3</span>\n</div>')}</div>

      <h3 class="doc-subhead">Ao lado do nome <span class="doc-subhead__meta">o avatar vira decoração</span></h3>
      <ul class="av-list" role="list">
        ${PEOPLE.slice(0, 3)
          .map(
            (name, i) => `<li class="av-list__item">
              ${avatar({ name, size: 'md', tone: 'auto', content: i === 0 ? 'image' : 'initials', status: ['online', 'away', 'offline'][i] }, { decorative: true, photo: PHOTOS[0] })}
              <div class="av-list__text"><p class="av-list__name">${name}</p><p class="av-list__meta">${['Online', 'Ausente', 'Offline'][i]} · ${['Design', 'Produto', 'Engenharia'][i]}</p></div>
            </li>`,
          )
          .join('')}
      </ul>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">O avatar é uma imagem de uma pessoa. Trate como tal.</p>
        </div>
      </header>
      ${a11yList([
        ['Nome acessível', 'Sozinho, o avatar leva <code class="ds-inline-code">role="img"</code> e <code class="ds-inline-code">aria-label</code> com o nome. As iniciais e a imagem ficam escondidas (<code class="ds-inline-code">aria-hidden</code> e <code class="ds-inline-code">alt=""</code>) para não serem lidas duas vezes.'],
        ['Ao lado do nome, decorativo', 'Se o nome já está escrito ao lado, o avatar inteiro sai com <code class="ds-inline-code">aria-hidden="true"</code>.'],
        ['Status não é só cor', 'Inclua o status no nome acessível (“Marina Duarte, online”) ou em texto visível.'],
        ['Contraste das iniciais', `Entre ${fmt(minContrast)}:1 e ${fmt(Math.max(...toneContrast.flatMap((c) => [c.dark, c.light])))}:1 em todos os tons e nos dois temas — acima dos 4,5:1 do WCAG.`],
        ['Grupo com contagem', 'O grupo é um <code class="ds-inline-code">role="group"</code> com o total no rótulo; o “+N” diz quantas pessoas estão ocultas.'],
        ['Dica com o nome', 'Em grupos, cada avatar mostra o nome no hover e no foco via tooltip.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Os tons usam as paletas de apoio direto (são categóricos); todo o resto é semântico.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.muted', 'Fundo neutro e do “+N”'],
        ['color.fg.muted', 'Iniciais e ícone no neutro'],
        ['color.border.subtle', 'Contorno'],
        ['color.bg.raised', 'Base dos tons tingidos'],
        ['radius.full', 'Forma redonda'],
        ['radius.md', 'Forma quadrada'],
        ['color.success.solid', 'Online'],
        ['color.warning.solid', 'Ausente'],
        ['color.danger.solid', 'Ocupado'],
        ['color.fg.disabled', 'Offline'],
        ['color.bg.canvas', 'Anel do status e do grupo'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Três cuidados para o avatar ajudar a reconhecer pessoas.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: tom estável pelo nome</p>
          <div class="av-usage__preview">${['Marina Duarte', 'Caio Ramos', 'Lia Nakamura'].map((name) => avatar({ name, size: 'md', tone: 'auto', content: 'initials' })).join('')}</div>
          <p class="usage-card__text">A mesma pessoa tem sempre a mesma cor — o olho aprende a reconhecer.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: ícone genérico para todo mundo</p>
          <div class="av-usage__preview">${['Marina Duarte', 'Caio Ramos', 'Lia Nakamura'].map((name) => avatar({ name, size: 'md', content: 'icon' })).join('')}</div>
          <p class="usage-card__text">Se você sabe o nome, use as iniciais. O ícone é só para quem não tem nome.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Grupo curto</p>
          <div class="av-usage__preview"><div class="ds-avatar-group">${PEOPLE.slice(0, 3).map((name) => avatar({ name, size: 'sm', tone: 'auto', content: 'initials' })).join('')}<span class="ds-avatar ds-avatar--sm ds-avatar--more" role="img" aria-label="Mais 4 pessoas">+4</span></div></div>
          <p class="usage-card__text">Até quatro rostos. Mais que isso vira mancha — use o “+N”.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'avatar',
    controls: [
      { id: 'content', label: 'Conteúdo', value: 'initials', options: CONTENTS.map(([value, label]) => ({ value, label })) },
      { id: 'size', label: 'Tamanho', value: 'xl', options: SIZES.map(([value, px]) => ({ value, label: `${value} · ${px} px` })) },
      { id: 'tone', label: 'Tom', value: 'auto', options: [{ value: 'auto', label: 'Pelo nome' }, { value: 'neutral', label: 'Neutro' }, ...TONES.map(([value, label]) => ({ value, label }))] },
      { id: 'shape', label: 'Forma', value: 'round', options: [{ value: 'round', label: 'Redonda' }, { value: 'square', label: 'Quadrada' }] },
      { id: 'status', label: 'Status', value: 'online', options: [{ value: 'none', label: 'Nenhum' }, ...STATUS.map(([value, label]) => ({ value, label }))] },
    ],
    text: { id: 'name', label: 'Nome', value: 'Marina Duarte' },
    render: (s) => `<div class="av-stage">${avatar(s)}<p class="av-stage__name">${escapeHtml(s.name || 'Sem nome')}</p></div>`,
    code: avatarCode,
  });

  const input = root.querySelector('[data-tone-input]');
  const preview = root.querySelector('[data-tone-preview]');
  const result = root.querySelector('[data-tone-result]');
  const onTone = () => {
    const name = input.value || 'Sem nome';
    preview.innerHTML = avatar({ name, size: 'lg', tone: 'auto', content: 'initials' });
    result.textContent = `Tom: ${TONES.find(([id]) => id === toneFor(name))[1]}`;
  };
  input.addEventListener('input', onTone);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);
  return () => {
    unmountPlayground();
    input.removeEventListener('input', onTone);
    unmountCopy();
    unmountNav();
  };
}
