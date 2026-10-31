import { icon } from '../../ds/icons/icons.js';

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
          <button type="button" class="ds-icon-btn" data-command-open aria-label="Buscar" data-ds-tooltip="Buscar" data-ds-tooltip-placement="bottom">${icon('search')}</button>
          <a class="ds-icon-btn" href="#/" aria-label="Fechar e voltar ao início" data-ds-tooltip="Voltar ao início" data-ds-tooltip-placement="bottom">${icon('x')}</a>
        </div>
        <div class="ds-panel__aside">
          <span class="ds-badge ds-badge--brand"><span class="ds-badge__dot"></span>Em construção</span>
        </div>
      </header>

      <div class="ds-panel__body">
        <section class="ds-section">
          <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>Sobre</span></p>
          <p class="ds-section__text">${page.description}</p>
        </section>
        ${topics
          .map(
            (topic, i) => `<section class="ds-section">
              <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span>${topic}</span></p>
              <div class="ds-section__actions"><span class="ds-inline-action" aria-disabled="true">${icon('clock', { size: 16 })}Em breve</span></div>
            </section>`,
          )
          .join('')}
      </div>

      <footer class="ds-panel__footer">
        <a class="ds-btn ds-btn--secondary" href="#/">${icon('arrow-left', { size: 18 })}Voltar ao início</a>
        <button type="button" class="ds-btn ds-btn--ghost" data-command-open>${icon('search', { size: 18 })}Buscar outra página</button>
      </footer>
    </article>
  </div>`;
}
