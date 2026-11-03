import { icon } from '../../ds/icons/icons.js';
import { palettes, tokens } from '../../ds/tokens.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { L, ratio as fmt } from '../i18n.js';
import { THEME_IDS, isDarkTheme } from '../themes.js';

export const styles = ['site/component-doc.css', 'site/pages/avatar.css'];

/* ───────── Dados (textos no idioma atual: chame na renderização) ───────── */

const ic = (s) => `<code class="ds-inline-code">${s}</code>`;

const SIZES = () => [
  ['xs', 24, L('Listas densas, tabelas', 'Dense lists, tables', 'Listas densas, tablas')],
  ['sm', 32, L('Comentários, menções', 'Comments, mentions', 'Comentarios, menciones')],
  ['md', 40, L('Padrão', 'Default', 'Predeterminado')],
  ['lg', 48, L('Cabeçalhos de card', 'Card headers', 'Encabezados de tarjeta')],
  ['xl', 64, L('Perfil, convite', 'Profile, invite', 'Perfil, invitación')],
];
const PX = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

const TONE_IDS = ['sand', 'clay', 'ochre', 'slate', 'green', 'teal', 'blue', 'violet', 'pink'];
const TONES = () => [
  ['sand', L('Areia', 'Sand', 'Arena')],
  ['clay', L('Argila', 'Clay', 'Arcilla')],
  ['ochre', L('Ocre', 'Ochre', 'Ocre')],
  ['slate', L('Ardósia', 'Slate', 'Pizarra')],
  ['green', L('Verde', 'Green', 'Verde')],
  ['teal', L('Verde-azulado', 'Teal', 'Verde azulado')],
  ['blue', L('Azul', 'Blue', 'Azul')],
  ['violet', L('Violeta', 'Violet', 'Violeta')],
  ['pink', L('Rosa', 'Pink', 'Rosa')],
];
const toneName = (id) => TONES().find(([t]) => t === id)[1];

const STATUS = () => [
  ['online', 'Online', 'color.success.solid'],
  ['away', L('Ausente', 'Away', 'Ausente'), 'color.warning.solid'],
  ['busy', L('Ocupado', 'Busy', 'Ocupado'), 'color.danger.solid'],
  ['offline', 'Offline', 'color.fg.disabled'],
];

const PEOPLE = ['Marina Duarte', 'Caio Ramos', 'Lia Nakamura', 'Otávio Prado', 'Bruna Sá', 'Rafael Couto', 'Teresa Lins'];

const noName = () => L('Sem nome', 'No name', 'Sin nombre');
const morePeople = (n) => L(`Mais ${n} pessoas`, `${n} more people`, `${n} personas más`);
const participants = (n) => L(`${n} participantes`, `${n} participants`, `${n} participantes`);

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
  return TONE_IDS[h % TONE_IDS.length];
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

// light-dark(): nos temas escuros as iniciais usam o tom 200; nos claros, o 800 — sobre o raised de cada tema
const toneContrast = TONE_IDS.map((p) => {
  const t = rgb(hexOf(p, '400'));
  return THEME_IDS.map((id) => ratio(rgb(hexOf(p, isDarkTheme(id) ? '200' : '800')), mix(t, rgb(raised[id].value), 0.24)));
});
const minContrast = Math.min(...toneContrast.flat());
const maxContrast = Math.max(...toneContrast.flat());

/* ───────── Montagem ───────── */

function avatarClasses(s) {
  const tone = s.tone === 'auto' ? toneFor(s.name) : s.tone;
  return ['ds-avatar', s.size && s.size !== 'md' && `ds-avatar--${s.size}`, tone && tone !== 'neutral' && s.content !== 'icon' && `ds-avatar--${tone}`, s.shape === 'square' && 'ds-avatar--square']
    .filter(Boolean)
    .join(' ');
}

const statusLabel = (s) => STATUS().find(([id]) => id === s.status)?.[1];

function avatar(s, { decorative = false, photo = PHOTOS[0], tooltip = false } = {}) {
  const name = s.name || noName();
  const px = PX[s.size || 'md'];
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
  const name = s.name || noName();
  const label = statusLabel(s) ? `${name}, ${statusLabel(s).toLowerCase()}` : name;
  const lines = [`<span class="${avatarClasses(s)}" role="img" aria-label="${label}">`];
  if (s.content === 'icon') lines.push('  <ds-icon name="user"></ds-icon>');
  else lines.push(`  <span aria-hidden="true">${initials(name)}</span>`);
  if (s.content === 'image' || s.content === 'broken') lines.push(`  <img src="${L('/fotos/marina.jpg', '/photos/marina.jpg', '/fotos/marina.jpg')}" alt="" onerror="this.remove()">`);
  if (s.status && s.status !== 'none') lines.push(`  <span class="ds-avatar__status ds-avatar__status--${s.status}" aria-hidden="true"></span>`);
  lines.push('</span>');
  return lines.join('\n');
}

const CONTENTS = () => [
  ['image', L('Imagem', 'Image', 'Imagen'), L('A foto da pessoa, recortada no círculo. As iniciais ficam por baixo, prontas para o caso de a imagem falhar.', 'The person’s photo, cropped to the circle. The initials sit underneath, ready in case the image fails.', 'La foto de la persona, recortada en el círculo. Las iniciales quedan debajo, listas por si la imagen falla.')],
  ['initials', L('Iniciais', 'Initials', 'Iniciales'), L('Primeira letra do primeiro e do último nome, num tom estável derivado do nome.', 'The first letter of the first and last name, in a stable tone derived from the name.', 'Primera letra del primer y del último nombre, en un tono estable derivado del nombre.')],
  ['icon', L('Ícone', 'Icon', 'Ícono'), L('Sem nome nem foto: convidados, contas genéricas, lugares vazios.', 'No name or photo: guests, generic accounts, empty seats.', 'Sin nombre ni foto: invitados, cuentas genéricas, lugares vacíos.')],
  ['broken', L('Imagem que falhou', 'Failed image', 'Imagen que falló'), L('O onerror remove a imagem e as iniciais aparecem — nada de ícone quebrado.', 'The onerror removes the image and the initials show — no broken icon.', 'El onerror quita la imagen y aparecen las iniciales — nada de ícono roto.')],
];

/* ───────── Página ───────── */

export default function renderAvatar(page) {
  const sizes = SIZES();
  const tones = TONES();
  const status = STATUS();
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Representa uma pessoa ou conta. Foto quando existe, iniciais num tom estável quando não — e sempre com um nome por trás.', 'Represents a person or account. A photo when there is one, initials in a stable tone when there isn’t — and always a name behind it.', 'Representa a una persona o cuenta. Foto cuando existe, iniciales en un tono estable cuando no — y siempre con un nombre detrás.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('tamanhos', 'sizes', 'tamaños')}</dt><dd class="doc-stat__value">${sizes.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('tons', 'tones', 'tonos')}</dt><dd class="doc-stat__value">${tones.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('status', 'statuses', 'estados')}</dt><dd class="doc-stat__value">${status.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('contraste mínimo', 'minimum contrast', 'contraste mínimo')}</dt><dd class="doc-stat__value">${fmt(minContrast)}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${[
        ['playground', 'Playground'],
        ['tamanhos', L('Tamanhos', 'Sizes', 'Tamaños')],
        ['tipos-de-conteudo', L('Conteúdo', 'Content', 'Contenido')],
        ['tons', L('Tons', 'Tones', 'Tonos')],
        ['status', L('Status', 'Status', 'Estado')],
        ['grupo', L('Grupo', 'Group', 'Grupo')],
        ['acessibilidade', L('Acessibilidade', 'Accessibility', 'Accesibilidad')],
        ['tokens', 'Tokens'],
        ['uso', L('Uso', 'Usage', 'Uso')],
      ]
        .map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`)
        .join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="playground-title">Playground</h2>
          <p class="doc-section__desc">${L('Troque o nome para ver as iniciais e o tom mudarem. “Imagem que falhou” mostra o fallback em ação.', 'Change the name to see the initials and tone change. “Failed image” shows the fallback in action.', 'Cambia el nombre para ver cómo cambian las iniciales y el tono. “Imagen que falló” muestra el respaldo en acción.')}</p>
        </div>
      </header>
      ${playgroundMarkup('avatar')}
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">${L('Tamanhos', 'Sizes', 'Tamaños')}</h2>
          <p class="doc-section__desc">${L('Cinco tamanhos. As iniciais e o status acompanham a proporção sozinhos.', 'Five sizes. The initials and status follow the proportion on their own.', 'Cinco tamaños. Las iniciales y el estado acompañan la proporción solos.')}</p>
        </div>
      </header>
      <div class="av-sizes">
        ${sizes.map(
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
          <h2 class="doc-section__title" id="conteudo-title">${L('Conteúdo', 'Content', 'Contenido')}</h2>
          <p class="doc-section__desc">${L('A ordem de preferência é sempre a mesma: imagem, iniciais, ícone.', 'The order of preference is always the same: image, initials, icon.', 'El orden de preferencia es siempre el mismo: imagen, iniciales, ícono.')}</p>
        </div>
      </header>
      <div class="cd-grid">
        ${CONTENTS().map(
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
          <h2 class="doc-section__title" id="tons-title">${L('Tons', 'Tones', 'Tonos')}</h2>
          <p class="doc-section__desc">${L('Nove tons das paletas de apoio, levemente tingidos sobre a superfície. O tom vem do nome: a mesma pessoa tem sempre a mesma cor, em qualquer tela.', 'Nine tones from the supporting palettes, lightly tinted over the surface. The tone comes from the name: the same person always gets the same color, on any screen.', 'Nueve tonos de las paletas de apoyo, levemente teñidos sobre la superficie. El tono viene del nombre: la misma persona tiene siempre el mismo color, en cualquier pantalla.')}</p>
        </div>
      </header>
      <div class="av-tones">
        <div class="av-tones__grid">
          ${[['neutral', L('Neutro', 'Neutral', 'Neutro')], ...tones]
            .map(
              ([id, label]) => `<div class="av-tone">
                ${avatar({ name: label, size: 'lg', tone: id, content: 'initials' }, { decorative: true })}
                <p class="av-tone__name">${label}</p>
                <code class="av-tone__class">${id === 'neutral' ? L('padrão', 'default', 'predeterminado') : `--${id}`}</code>
              </div>`,
            )
            .join('')}
        </div>
        <div class="av-tones__try">
          <label class="ds-form-field__label av-tones__label" for="av-name">${L('Teste um nome', 'Try a name', 'Prueba un nombre')}</label>
          <div class="av-tones__row">
            <span data-tone-preview>${avatar({ name: 'Lia Nakamura', size: 'lg', tone: 'auto', content: 'initials' })}</span>
            <div class="ds-field av-tones__field"><input class="ds-field__input" id="av-name" type="text" value="Lia Nakamura" data-tone-input spellcheck="false"></div>
          </div>
          <p class="av-tones__result" data-tone-result>${L('Tom', 'Tone', 'Tono')}: ${toneName(toneFor('Lia Nakamura'))}</p>
          <p class="av-tones__contrast">${icon('check-circle', { size: 16 })}${L(`Contraste das iniciais entre ${fmt(minContrast)} e ${fmt(maxContrast)} nos três temas.`, `Initials contrast between ${fmt(minContrast)} and ${fmt(maxContrast)} in all three themes.`, `Contraste de las iniciales entre ${fmt(minContrast)} y ${fmt(maxContrast)} en los tres temas.`)}</p>
        </div>
      </div>
      <div class="av-code">${codeBlock(`// ${L('mesmo nome, mesmo tom', 'same name, same tone', 'mismo nombre, mismo tono')}\nfunction toneFor(name) {\n  let h = 0;\n  for (const ch of name.normalize('NFD')) h = (h * 31 + ch.codePointAt(0)) >>> 0;\n  return TONES[h % TONES.length];\n}`)}</div>
    </section>

    <section class="doc-section" id="status" aria-labelledby="status-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="status-title">${L('Status', 'Status', 'Estado')}</h2>
          <p class="doc-section__desc">${L('Um ponto no canto, com um anel na cor do fundo para separar. Status não é só cor: diga também no nome acessível ou no texto ao lado.', 'A dot in the corner, with a ring in the background color to separate it. Status isn’t just color: say it in the accessible name or the text beside it too.', 'Un punto en la esquina, con un anillo del color del fondo para separar. El estado no es solo color: dilo también en el nombre accesible o en el texto al lado.')}</p>
        </div>
      </header>
      <div class="av-status">
        ${status.map(
          ([id, label]) => `<div class="av-status__item">
            ${avatar({ name: 'Otávio Prado', size: 'lg', tone: 'auto', content: 'image', status: id }, { photo: PHOTOS[1] })}
            <div><p class="av-status__name">${label}</p><code class="av-status__class">ds-avatar__status--${id}</code></div>
          </div>`,
        ).join('')}
      </div>
      <p class="av-note">${icon('info', { size: 16 })}<span>${L(`Sobre outra superfície, ajuste o anel com ${ic('--ds-avatar-ring')} (padrão: o fundo do canvas).`, `On another surface, adjust the ring with ${ic('--ds-avatar-ring')} (default: the canvas background).`, `Sobre otra superficie, ajusta el anillo con ${ic('--ds-avatar-ring')} (predeterminado: el fondo del canvas).`)}</span></p>
    </section>

    <section class="doc-section" id="grupo" aria-labelledby="grupo-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="grupo-title">${L('Grupo', 'Group', 'Grupo')}</h2>
          <p class="doc-section__desc">${L('Avatares sobrepostos para mostrar quem participa. Até quatro rostos e um “+N” para o resto. Passe o mouse para ver os nomes.', 'Overlapping avatars to show who’s taking part. Up to four faces and a “+N” for the rest. Hover to see the names.', 'Avatares superpuestos para mostrar quién participa. Hasta cuatro rostros y un “+N” para el resto. Pasa el mouse para ver los nombres.')}</p>
        </div>
      </header>
      <div class="av-groups">
        ${['sm', 'md', 'lg']
          .map(
            (size) => `<div class="av-group-row">
              <div class="ds-avatar-group" role="group" aria-label="${participants(PEOPLE.length)}">
                ${PEOPLE.slice(0, 4)
                  .map((name, i) => avatar({ name, size, tone: 'auto', content: i === 1 ? 'image' : 'initials' }, { photo: PHOTOS[2], tooltip: true }))
                  .join('')}
                <span class="ds-avatar ds-avatar--more${size === 'md' ? '' : ` ds-avatar--${size}`}" role="img" aria-label="${morePeople(PEOPLE.length - 4)}" data-ds-tooltip="${PEOPLE.slice(4).join(', ')}" data-ds-tooltip-placement="bottom">+${PEOPLE.length - 4}</span>
              </div>
              <code class="ds-inline-code">${size === 'md' ? 'ds-avatar' : `ds-avatar--${size}`}</code>
            </div>`,
          )
          .join('')}
      </div>
      <div class="av-code">${codeBlock(`<div class="ds-avatar-group" role="group" aria-label="${participants(7)}">\n  <span class="ds-avatar ds-avatar--sm ds-avatar--violet" role="img" aria-label="Marina Duarte">\n    <span aria-hidden="true">MD</span>\n  </span>\n  …\n  <span class="ds-avatar ds-avatar--sm ds-avatar--more" role="img" aria-label="${morePeople(3)}">+3</span>\n</div>`)}</div>

      <h3 class="doc-subhead">${L('Ao lado do nome', 'Next to the name', 'Junto al nombre')} <span class="doc-subhead__meta">${L('o avatar vira decoração', 'the avatar becomes decoration', 'el avatar se vuelve decoración')}</span></h3>
      <ul class="av-list" role="list">
        ${PEOPLE.slice(0, 3)
          .map(
            (name, i) => `<li class="av-list__item">
              ${avatar({ name, size: 'md', tone: 'auto', content: i === 0 ? 'image' : 'initials', status: ['online', 'away', 'offline'][i] }, { decorative: true, photo: PHOTOS[0] })}
              <div class="av-list__text"><p class="av-list__name">${name}</p><p class="av-list__meta">${['Online', L('Ausente', 'Away', 'Ausente'), 'Offline'][i]} · ${['Design', L('Produto', 'Product', 'Producto'), L('Engenharia', 'Engineering', 'Ingeniería')][i]}</p></div>
            </li>`,
          )
          .join('')}
      </ul>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">${L('Acessibilidade', 'Accessibility', 'Accesibilidad')}</h2>
          <p class="doc-section__desc">${L('O avatar é uma imagem de uma pessoa. Trate como tal.', 'An avatar is an image of a person. Treat it as one.', 'El avatar es una imagen de una persona. Trátalo como tal.')}</p>
        </div>
      </header>
      ${a11yList([
        [L('Nome acessível', 'Accessible name', 'Nombre accesible'), L(`Sozinho, o avatar leva ${ic('role="img"')} e ${ic('aria-label')} com o nome. As iniciais e a imagem ficam escondidas (${ic('aria-hidden')} e ${ic('alt=""')}) para não serem lidas duas vezes.`, `On its own, the avatar gets ${ic('role="img"')} and an ${ic('aria-label')} with the name. The initials and the image are hidden (${ic('aria-hidden')} and ${ic('alt=""')}) so they aren’t read twice.`, `Solo, el avatar lleva ${ic('role="img"')} y ${ic('aria-label')} con el nombre. Las iniciales y la imagen quedan ocultas (${ic('aria-hidden')} y ${ic('alt=""')}) para no leerse dos veces.`)],
        [L('Ao lado do nome, decorativo', 'Next to the name, decorative', 'Junto al nombre, decorativo'), L(`Se o nome já está escrito ao lado, o avatar inteiro sai com ${ic('aria-hidden="true"')}.`, `If the name is already written beside it, the whole avatar gets ${ic('aria-hidden="true"')}.`, `Si el nombre ya está escrito al lado, el avatar entero lleva ${ic('aria-hidden="true"')}.`)],
        [L('Status não é só cor', 'Status isn’t just color', 'El estado no es solo color'), L('Inclua o status no nome acessível (“Marina Duarte, online”) ou em texto visível.', 'Include the status in the accessible name (“Marina Duarte, online”) or in visible text.', 'Incluye el estado en el nombre accesible (“Marina Duarte, online”) o en texto visible.')],
        [L('Contraste das iniciais', 'Initials contrast', 'Contraste de las iniciales'), L(`Entre ${fmt(minContrast)} e ${fmt(maxContrast)} em todos os tons e nos três temas — acima dos ${fmt(4.5, 1)} do WCAG.`, `Between ${fmt(minContrast)} and ${fmt(maxContrast)} across all tones and all three themes — above WCAG’s ${fmt(4.5, 1)}.`, `Entre ${fmt(minContrast)} y ${fmt(maxContrast)} en todos los tonos y en los tres temas — por encima del ${fmt(4.5, 1)} de WCAG.`)],
        [L('Grupo com contagem', 'A group with a count', 'Grupo con conteo'), L(`O grupo é um ${ic('role="group"')} com o total no rótulo; o “+N” diz quantas pessoas estão ocultas.`, `The group is a ${ic('role="group"')} with the total in its label; the “+N” says how many people are hidden.`, `El grupo es un ${ic('role="group"')} con el total en la etiqueta; el “+N” dice cuántas personas están ocultas.`)],
        [L('Dica com o nome', 'A tooltip with the name', 'Tooltip con el nombre'), L('Em grupos, cada avatar mostra o nome no hover e no foco via tooltip.', 'In groups, each avatar shows the name on hover and focus via a tooltip.', 'En grupos, cada avatar muestra el nombre al pasar el mouse y al recibir foco mediante un tooltip.')],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">${L('Tokens usados', 'Tokens used', 'Tokens usados')}</h2>
          <p class="doc-section__desc">${L('Os tons usam as paletas de apoio direto (são categóricos); todo o resto é semântico.', 'The tones use the supporting palettes directly (they’re categorical); everything else is semantic.', 'Los tonos usan las paletas de apoyo directamente (son categóricos); todo lo demás es semántico.')}</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.muted', L('Fundo neutro e do “+N”', 'Neutral and “+N” background', 'Fondo neutro y del “+N”')],
        ['color.fg.muted', L('Iniciais e ícone no neutro', 'Initials and icon on neutral', 'Iniciales e ícono en el neutro')],
        ['color.border.subtle', L('Contorno', 'Outline', 'Contorno')],
        ['color.bg.raised', L('Base dos tons tingidos', 'Base for the tinted tones', 'Base de los tonos teñidos')],
        ['radius.full', L('Forma redonda', 'Round shape', 'Forma redonda')],
        ['radius.md', L('Forma quadrada', 'Square shape', 'Forma cuadrada')],
        ['color.success.solid', 'Online'],
        ['color.warning.solid', L('Ausente', 'Away', 'Ausente')],
        ['color.danger.solid', L('Ocupado', 'Busy', 'Ocupado')],
        ['color.fg.disabled', 'Offline'],
        ['color.bg.canvas', L('Anel do status e do grupo', 'Status and group ring', 'Anillo del estado y del grupo')],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">${L('Uso', 'Usage', 'Uso')}</h2>
          <p class="doc-section__desc">${L('Três cuidados para o avatar ajudar a reconhecer pessoas.', 'Three things that help the avatar make people recognizable.', 'Tres cuidados para que el avatar ayude a reconocer personas.')}</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}${L('Faça: tom estável pelo nome', 'Do: a stable tone from the name', 'Haz: tono estable por el nombre')}</p>
          <div class="av-usage__preview">${['Marina Duarte', 'Caio Ramos', 'Lia Nakamura'].map((name) => avatar({ name, size: 'md', tone: 'auto', content: 'initials' })).join('')}</div>
          <p class="usage-card__text">${L('A mesma pessoa tem sempre a mesma cor — o olho aprende a reconhecer.', 'The same person always gets the same color — the eye learns to recognize it.', 'La misma persona tiene siempre el mismo color — el ojo aprende a reconocerla.')}</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}${L('Evite: ícone genérico para todo mundo', 'Avoid: a generic icon for everyone', 'Evita: ícono genérico para todos')}</p>
          <div class="av-usage__preview">${['Marina Duarte', 'Caio Ramos', 'Lia Nakamura'].map((name) => avatar({ name, size: 'md', content: 'icon' })).join('')}</div>
          <p class="usage-card__text">${L('Se você sabe o nome, use as iniciais. O ícone é só para quem não tem nome.', 'If you know the name, use the initials. The icon is only for those without a name.', 'Si sabes el nombre, usa las iniciales. El ícono es solo para quien no tiene nombre.')}</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}${L('Grupo curto', 'Keep groups short', 'Grupo corto')}</p>
          <div class="av-usage__preview"><div class="ds-avatar-group">${PEOPLE.slice(0, 3).map((name) => avatar({ name, size: 'sm', tone: 'auto', content: 'initials' })).join('')}<span class="ds-avatar ds-avatar--sm ds-avatar--more" role="img" aria-label="${morePeople(4)}">+4</span></div></div>
          <p class="usage-card__text">${L('Até quatro rostos. Mais que isso vira mancha — use o “+N”.', 'Up to four faces. More than that turns into a blur — use the “+N”.', 'Hasta cuatro rostros. Más que eso se vuelve una mancha — usa el “+N”.')}</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'avatar',
    controls: [
      { id: 'content', label: L('Conteúdo', 'Content', 'Contenido'), value: 'initials', options: CONTENTS().map(([value, label]) => ({ value, label })) },
      { id: 'size', label: L('Tamanho', 'Size', 'Tamaño'), value: 'xl', options: SIZES().map(([value, px]) => ({ value, label: `${value} · ${px} px` })) },
      { id: 'tone', label: L('Tom', 'Tone', 'Tono'), value: 'auto', options: [{ value: 'auto', label: L('Pelo nome', 'From the name', 'Por el nombre') }, { value: 'neutral', label: L('Neutro', 'Neutral', 'Neutro') }, ...TONES().map(([value, label]) => ({ value, label }))] },
      { id: 'shape', label: L('Forma', 'Shape', 'Forma'), value: 'round', options: [{ value: 'round', label: L('Redonda', 'Round', 'Redonda') }, { value: 'square', label: L('Quadrada', 'Square', 'Cuadrada') }] },
      { id: 'status', label: L('Status', 'Status', 'Estado'), value: 'online', options: [{ value: 'none', label: L('Nenhum', 'None', 'Ninguno') }, ...STATUS().map(([value, label]) => ({ value, label }))] },
    ],
    text: { id: 'name', label: L('Nome', 'Name', 'Nombre'), value: 'Marina Duarte' },
    render: (s) => `<div class="av-stage">${avatar(s)}<p class="av-stage__name">${escapeHtml(s.name || noName())}</p></div>`,
    code: avatarCode,
  });

  const input = root.querySelector('[data-tone-input]');
  const preview = root.querySelector('[data-tone-preview]');
  const result = root.querySelector('[data-tone-result]');
  const onTone = () => {
    const name = input.value || noName();
    preview.innerHTML = avatar({ name, size: 'lg', tone: 'auto', content: 'initials' });
    result.textContent = `${L('Tom', 'Tone', 'Tono')}: ${toneName(toneFor(name))}`;
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
