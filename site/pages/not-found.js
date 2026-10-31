import { icon } from '../../ds/icons/icons.js';

export default function renderNotFound({ path }) {
  return `
  <div class="page page--panel">
    <article class="ds-panel" aria-labelledby="page-title">
      <header class="ds-panel__header">
        <div>
          <p class="ds-panel__eyebrow">Erro 404</p>
          <h1 class="ds-panel__title" id="page-title">Essa página saiu de órbita.</h1>
        </div>
        <div class="ds-panel__actions">
          <a class="ds-icon-btn" href="#/" aria-label="Fechar e voltar ao início">${icon('x')}</a>
        </div>
      </header>
      <div class="ds-panel__body">
        <section class="ds-section">
          <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>O que aconteceu</span></p>
          <p class="ds-section__text">Não encontramos <code>${String(path).replace(/</g, '&lt;')}</code>. Ela pode ter mudado de lugar ou ainda não existir.</p>
        </section>
      </div>
      <footer class="ds-panel__footer">
        <a class="ds-btn ds-btn--primary" href="#/">${icon('home', { size: 18 })}Ir para o início</a>
        <button type="button" class="ds-btn ds-btn--ghost" data-command-open>${icon('search', { size: 18 })}Buscar</button>
      </footer>
    </article>
  </div>`;
}
