import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { releases, upcoming, TYPES, CURRENT_VERSION, SEEN_KEY } from '../changelog.js';

export const styles = 'site/pages/novidades.css';

const current = releases[0];
const allItems = releases.flatMap((r) => r.groups.flatMap((g) => g.items));
const countOf = (type) => current.groups.flatMap((g) => g.items).filter(([t]) => type === 'all' || t === type).length;
const longDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
const slug = (v) => `v${v.replace(/\./g, '')}`;

const FILTERS = [
  ['all', 'Todos'],
  ['novo', 'Novo'],
  ['melhoria', 'Melhoria'],
  ['correcao', 'Correção'],
];

function releaseSection(r, isCurrent) {
  return `<section class="doc-section" id="${slug(r.version)}" aria-labelledby="${slug(r.version)}-title">
    <div class="nv-release">
      <aside class="nv-release__meta">
        <h2 class="nv-release__version" id="${slug(r.version)}-title"><span class="ds-visually-hidden">Versão </span>${r.version}</h2>
        <p class="nv-release__date"><time datetime="${r.date}">${longDate(r.date)}</time></p>
        ${isCurrent ? '<span class="ds-badge ds-badge--sm ds-badge--success">Atual</span>' : ''}
      </aside>
      <div class="nv-release__body">
        <h3 class="nv-release__title">${r.title}</h3>
        <p class="nv-release__summary">${r.summary}</p>
        ${
          isCurrent
            ? `<div class="nv-filters" role="group" aria-label="Filtrar por tipo">
                ${FILTERS.map(([id, label]) => `<button type="button" class="ds-chip ds-chip--sm" data-filter="${id}" aria-pressed="${id === 'all'}">${label}<span class="nv-filters__count">${countOf(id)}</span></button>`).join('')}
              </div>`
            : ''
        }
        <div class="nv-groups" data-groups>
          ${r.groups
            .map(
              (g) => `<div class="nv-group" data-group>
                <h4 class="nv-group__title">${g.name}</h4>
                <ul class="nv-list" role="list">
                  ${g.items
                    .map(([type, text, href]) => {
                      const [tone, label] = TYPES[type];
                      return `<li class="nv-item" data-type="${type}">
                        <span class="ds-badge ds-badge--sm ds-badge--${tone} nv-item__type">${label}</span>
                        <span class="nv-item__text">${text}</span>
                        <a class="ds-inline-action nv-item__link" href="#${href}" aria-label="Ver: ${text}">Ver${icon('arrow-right', { size: 14 })}</a>
                      </li>`;
                    })
                    .join('')}
                </ul>
              </div>`,
            )
            .join('')}
          <p class="nv-empty" data-empty hidden>Nada deste tipo nesta versão.</p>
        </div>
      </div>
    </div>
  </section>`;
}

export default function renderNovidades() {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">Órbita</p>
        <h1 class="doc-header__title">Novidades</h1>
        <p class="doc-header__lead">Tudo o que mudou, versão a versão — e o que vem por aí.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">versão atual</dt><dd class="doc-stat__value">${CURRENT_VERSION}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">lançada em</dt><dd class="doc-stat__value">${shortDate(current.date)}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">mudanças</dt><dd class="doc-stat__value">${allItems.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">próximas versões</dt><dd class="doc-stat__value">${upcoming.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${releases.map((r) => `<button type="button" class="doc-nav__link" data-target="${slug(r.version)}">Versão ${r.version}</button>`).join('')}
      <button type="button" class="doc-nav__link" data-target="proximas">Próximas versões</button>
      <button type="button" class="doc-nav__link" data-target="versionamento">Versionamento</button>
    </nav>

    ${releases.map((r, i) => releaseSection(r, i === 0)).join('')}

    <section class="doc-section" id="proximas" aria-labelledby="proximas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="proximas-title">Próximas versões</h2>
          <p class="doc-section__desc">O plano daqui para a frente. A ordem pode mudar conforme o uso pedir.</p>
        </div>
      </header>
      <ol class="nv-upcoming" role="list">
        ${upcoming
          .map(
            (u) => `<li class="nv-next">
              <p class="nv-next__head"><span class="nv-next__version">${u.version}</span><span class="ds-badge ds-badge--sm${u.status[0] === 'neutral' ? '' : ` ds-badge--${u.status[0]}`}">${u.status[1]}</span></p>
              <h3 class="nv-next__title">${u.title}</h3>
              <p class="nv-next__text">${u.text}</p>
              <ul class="nv-next__items" role="list">
                ${u.items.map((item) => `<li>${icon('clock', { size: 16 })}${item}</li>`).join('')}
              </ul>
            </li>`,
          )
          .join('')}
      </ol>
    </section>

    <section class="doc-section" id="versionamento" aria-labelledby="versionamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="versionamento-title">Versionamento</h2>
          <p class="doc-section__desc">O número da versão diz o que esperar ao atualizar. Enquanto estivermos em 0.x, mudanças maiores ainda podem vir numa versão menor — sempre avisadas aqui.</p>
        </div>
      </header>
      <div class="nv-semver">
        ${[
          ['1.0.0', 0, 'Maior', 'Muda algo que você usa. Vem com guia de migração.'],
          ['0.1.0', 1, 'Menor', 'Componentes, tokens e páginas novos — sem quebrar nada.'],
          ['0.0.1', 2, 'Correção', 'Ajustes e correções de bugs.'],
        ]
          .map(
            ([v, part, name, text]) => `<article class="nv-semver__card">
              <p class="nv-semver__number">${v.split('.').map((n, i) => `<span${i === part ? ' class="nv-semver__part"' : ''}>${n}</span>`).join('.')}</p>
              <h3 class="nv-semver__name">${name}</h3>
              <p class="nv-semver__text">${text}</p>
            </article>`,
          )
          .join('')}
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  // visitar a página apaga o indicador de novidade da sidebar
  try {
    localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
  } catch {}
  document.querySelector('.ds-sidebar .ds-nav-item[href="#/novidades"] .ds-dot')?.remove();

  const groups = root.querySelector('[data-groups]');
  const onClick = (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    const type = chip.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    let visible = 0;
    groups.querySelectorAll('[data-group]').forEach((g) => {
      let shown = 0;
      g.querySelectorAll('[data-type]').forEach((item) => {
        const show = type === 'all' || item.dataset.type === type;
        item.hidden = !show;
        if (show) shown++;
      });
      g.hidden = shown === 0;
      visible += shown;
    });
    groups.querySelector('[data-empty]').hidden = visible > 0;
  };
  root.addEventListener('click', onClick);

  const unmountNav = mountDocNav(root);
  return () => {
    root.removeEventListener('click', onClick);
    unmountNav();
  };
}
