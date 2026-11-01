import { icon } from '../../ds/icons/icons.js';
import { dateFormat } from '../../ds/js/i18n.js';
import { L } from '../i18n.js';
import { mountDocNav } from '../doc-nav.js';
import { releases, upcoming, TYPES, CURRENT_VERSION, SEEN_KEY } from '../changelog.js';

export const styles = 'site/pages/novidades.css';

const current = releases[0];
const countOf = (type) => current.groups.flatMap((g) => g.items).filter(([t]) => type === 'all' || t === type).length;
const day = (iso) => new Date(`${iso}T12:00:00`);
const longDate = (iso) => dateFormat({ day: 'numeric', month: 'long', year: 'numeric' }).format(day(iso));
const shortDate = (iso) => dateFormat({ day: '2-digit', month: 'short' }).format(day(iso)).replace('.', '');
const slug = (v) => `v${v.replace(/\./g, '')}`;

const FILTERS = () => [['all', L('Todos', 'All', 'Todos')], ...Object.entries(TYPES).map(([id, t]) => [id, t.label])];

const SEMVER = () => [
  ['1.0.0', 0, L('Maior', 'Major', 'Mayor'), L('Muda algo que você usa. Vem com guia de migração.', 'Changes something you use. Comes with a migration guide.', 'Cambia algo que usas. Viene con guía de migración.')],
  ['0.1.0', 1, L('Menor', 'Minor', 'Menor'), L('Componentes, tokens e páginas novos — sem quebrar nada.', 'New components, tokens, and pages — without breaking anything.', 'Componentes, tokens y páginas nuevos — sin romper nada.')],
  ['0.0.1', 2, L('Correção', 'Patch', 'Parche'), L('Ajustes e correções de bugs.', 'Tweaks and bug fixes.', 'Ajustes y corrección de bugs.')],
];

function releaseSection(r, isCurrent) {
  const version = L('Versão', 'Version', 'Versión');
  return `<section class="doc-section" id="${slug(r.version)}" aria-labelledby="${slug(r.version)}-title">
    <div class="nv-release">
      <aside class="nv-release__meta">
        <h2 class="nv-release__version" id="${slug(r.version)}-title"><span class="ds-visually-hidden">${version} </span>${r.version}</h2>
        <p class="nv-release__date"><time datetime="${r.date}">${longDate(r.date)}</time></p>
        ${isCurrent ? `<span class="ds-badge ds-badge--sm ds-badge--success">${L('Atual', 'Current', 'Actual')}</span>` : ''}
      </aside>
      <div class="nv-release__body">
        <h3 class="nv-release__title">${r.title}</h3>
        <p class="nv-release__summary">${r.summary}</p>
        ${
          isCurrent
            ? `<div class="nv-filters" role="group" aria-label="${L('Filtrar por tipo', 'Filter by type', 'Filtrar por tipo')}">
                ${FILTERS().map(([id, label]) => `<button type="button" class="ds-chip ds-chip--sm" data-filter="${id}" aria-pressed="${id === 'all'}">${label}<span class="nv-filters__count">${countOf(id)}</span></button>`).join('')}
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
                      const { tone, label } = TYPES[type];
                      return `<li class="nv-item" data-type="${type}">
                        <span class="ds-badge ds-badge--sm ds-badge--${tone} nv-item__type">${label}</span>
                        <span class="nv-item__text">${text}</span>
                        <a class="ds-inline-action nv-item__link" href="#${href}" aria-label="${L('Ver', 'See', 'Ver')}: ${text}">${L('Ver', 'See', 'Ver')}${icon('arrow-right', { size: 14 })}</a>
                      </li>`;
                    })
                    .join('')}
                </ul>
              </div>`,
            )
            .join('')}
          <p class="nv-empty" data-empty hidden>${L('Nada deste tipo nesta versão.', 'Nothing of this type in this version.', 'Nada de este tipo en esta versión.')}</p>
        </div>
      </div>
    </div>
  </section>`;
}

export default function renderNovidades(page) {
  const changes = releases.reduce((sum, r) => sum + r.groups.reduce((n, g) => n + g.items.length, 0), 0);
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">Órbita</p>
        <h1 class="doc-header__title">${page.label}</h1>
        <p class="doc-header__lead">${L('Tudo o que mudou, versão a versão — e o que vem por aí.', 'Everything that changed, version by version — and what’s coming next.', 'Todo lo que cambió, versión a versión — y lo que viene.')}</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">${L('versão atual', 'current version', 'versión actual')}</dt><dd class="doc-stat__value">${CURRENT_VERSION}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('lançada em', 'released', 'lanzada el')}</dt><dd class="doc-stat__value">${shortDate(current.date)}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('mudanças', 'changes', 'cambios')}</dt><dd class="doc-stat__value">${changes}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">${L('próximas versões', 'upcoming versions', 'próximas versiones')}</dt><dd class="doc-stat__value">${upcoming.length}</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="${L('Nesta página', 'On this page', 'En esta página')}">
      ${releases.map((r) => `<button type="button" class="doc-nav__link" data-target="${slug(r.version)}">${L('Versão', 'Version', 'Versión')} ${r.version}</button>`).join('')}
      <button type="button" class="doc-nav__link" data-target="proximas">${L('Próximas versões', 'Upcoming versions', 'Próximas versiones')}</button>
      <button type="button" class="doc-nav__link" data-target="versionamento">${L('Versionamento', 'Versioning', 'Versionado')}</button>
    </nav>

    ${releases.map((r, i) => releaseSection(r, i === 0)).join('')}

    <section class="doc-section" id="proximas" aria-labelledby="proximas-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="proximas-title">${L('Próximas versões', 'Upcoming versions', 'Próximas versiones')}</h2>
          <p class="doc-section__desc">${L('O plano daqui para a frente. A ordem pode mudar conforme o uso pedir.', 'The plan from here on. The order may change as usage demands.', 'El plan de aquí en adelante. El orden puede cambiar según lo pida el uso.')}</p>
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
          <h2 class="doc-section__title" id="versionamento-title">${L('Versionamento', 'Versioning', 'Versionado')}</h2>
          <p class="doc-section__desc">${L('O número da versão diz o que esperar ao atualizar. Enquanto estivermos em 0.x, mudanças maiores ainda podem vir numa versão menor — sempre avisadas aqui.', 'The version number tells you what to expect when updating. While we’re on 0.x, major changes can still come in a minor version — always announced here.', 'El número de versión dice qué esperar al actualizar. Mientras estemos en 0.x, los cambios mayores todavía pueden llegar en una versión menor — siempre avisados aquí.')}</p>
        </div>
      </header>
      <div class="nv-semver">
        ${SEMVER()
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
  // visitar a página marca a versão como vista: a sidebar tira a bolinha e o cartão de novidades
  try {
    localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
  } catch {}
  document.dispatchEvent(new CustomEvent('ds:newsseen'));

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
