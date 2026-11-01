import { icon } from '../../ds/icons/icons.js';
import { L } from '../i18n.js';

export default function renderPlaceholder(page) {
  const topics = page.topics ?? [];
  return `
  <div class="page page--panel">
    <article class="ds-panel" aria-labelledby="page-title">
      <header class="ds-panel__header">
        <div>
          <p class="ds-panel__eyebrow">${page.group ?? 'Órbita'}</p>
          <h1 class="ds-panel__title" id="page-title">${page.label}</h1>
        </div>
        <div class="ds-panel__actions">
          <button type="button" class="ds-icon-btn" data-command-open aria-label="${L('Buscar', 'Search', 'Buscar')}" data-ds-tooltip="${L('Buscar', 'Search', 'Buscar')}" data-ds-tooltip-placement="bottom">${icon('search')}</button>
          <a class="ds-icon-btn" href="#/" aria-label="${L('Fechar e voltar ao início', 'Close and go back home', 'Cerrar y volver al inicio')}" data-ds-tooltip="${L('Voltar ao início', 'Back to home', 'Volver al inicio')}" data-ds-tooltip-placement="bottom">${icon('x')}</a>
        </div>
        <div class="ds-panel__aside">
          <span class="ds-badge ds-badge--brand"><span class="ds-badge__dot"></span>${L('Em construção', 'Under construction', 'En construcción')}</span>
        </div>
      </header>

      <div class="ds-panel__body">
        <section class="ds-section">
          <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>${L('Sobre', 'About', 'Acerca de')}</span></p>
          <p class="ds-section__text">${page.description}</p>
        </section>
        ${topics
          .map(
            (topic, i) => `<section class="ds-section">
              <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span>${topic}</span></p>
              <div class="ds-section__actions"><span class="ds-inline-action" aria-disabled="true">${icon('clock', { size: 16 })}${L('Em breve', 'Soon', 'Pronto')}</span></div>
            </section>`,
          )
          .join('')}
      </div>

      <footer class="ds-panel__footer">
        <a class="ds-btn ds-btn--secondary" href="#/">${icon('arrow-left', { size: 18 })}${L('Voltar ao início', 'Back to home', 'Volver al inicio')}</a>
        <button type="button" class="ds-btn ds-btn--ghost" data-command-open>${icon('search', { size: 18 })}${L('Buscar outra página', 'Search for another page', 'Buscar otra página')}</button>
      </footer>
    </article>
  </div>`;
}
