import { icon } from '../../ds/icons/icons.js';
import { tr } from '../../ds/js/i18n.js';
import { T } from '../i18n.js';

const COPY = T(
  {
    eyebrow: 'Erro 404',
    title: 'Essa página saiu de órbita.',
    close: 'Fechar e voltar ao início',
    what: 'O que aconteceu',
    text: (path) => `Não encontramos ${path}. Ela pode ter mudado de lugar ou ainda não existir.`,
    home: 'Ir para o início',
    search: 'Buscar',
  },
  {
    eyebrow: 'Error 404',
    title: 'This page drifted out of orbit.',
    close: 'Close and go back home',
    what: 'What happened',
    text: (path) => `We couldn’t find ${path}. It may have moved or may not exist yet.`,
    home: 'Go home',
    search: 'Search',
  },
  {
    eyebrow: 'Error 404',
    title: 'Esta página salió de órbita.',
    close: 'Cerrar y volver al inicio',
    what: 'Qué pasó',
    text: (path) => `No encontramos ${path}. Puede que haya cambiado de lugar o que todavía no exista.`,
    home: 'Ir al inicio',
    search: 'Buscar',
  },
);

export default function renderNotFound({ path }) {
  const c = tr(COPY);
  return `
  <div class="page page--panel">
    <article class="ds-panel" aria-labelledby="page-title">
      <header class="ds-panel__header">
        <div>
          <p class="ds-panel__eyebrow">${c.eyebrow}</p>
          <h1 class="ds-panel__title" id="page-title">${c.title}</h1>
        </div>
        <div class="ds-panel__actions">
          <a class="ds-icon-btn" href="#/" aria-label="${c.close}">${icon('x')}</a>
        </div>
      </header>
      <div class="ds-panel__body">
        <section class="ds-section">
          <p class="ds-section__head"><span class="ds-section__stamp">00</span><span>${c.what}</span></p>
          <p class="ds-section__text">${c.text(`<code>${String(path).replace(/</g, '&lt;')}</code>`)}</p>
        </section>
      </div>
      <footer class="ds-panel__footer">
        <a class="ds-btn ds-btn--primary" href="#/">${icon('home', { size: 18 })}${c.home}</a>
        <button type="button" class="ds-btn ds-btn--ghost" data-command-open>${icon('search', { size: 18 })}${c.search}</button>
      </footer>
    </article>
  </div>`;
}
