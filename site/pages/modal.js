import { icon } from '../../ds/icons/icons.js';
import { openModal, confirmModal, modalContent, modalClasses } from '../../ds/js/modal.js';
import { toast } from '../../ds/js/toast.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/modal.css'];

/* ───────── Dados ───────── */

const SIZES = [
  ['sm', 'Pequeno', 400, 'Confirmações e avisos de uma frase.'],
  ['md', 'Médio', 520, 'O padrão: decisões com contexto e formulários curtos.'],
  ['lg', 'Grande', 720, 'Conteúdo maior, como uma prévia ou uma lista para revisar.'],
];

const BODIES = {
  default: 'As mudanças ficam visíveis para toda a equipe assim que você publicar.',
  danger: 'O projeto e os 12 arquivos dele serão apagados. Não dá para desfazer.',
};

const LONG_BODY = Array.from({ length: 8 }, (_, i) =>
  `<p>${i + 1}. Cada alteração entra no histórico com autor, data e o que mudou. Você pode comparar versões e voltar a qualquer uma delas antes de publicar.</p>`,
).join('');

const FORM_BODY = `<div class="md-form">
  <label class="md-form__label" for="md-form-name">Nome do projeto</label>
  <div class="ds-field"><input class="ds-field__input" id="md-form-name" type="text" value="Lançamento 0.1" autofocus></div>
  <p class="md-form__hint">Aparece na sidebar e nos convites.</p>
</div>`;

/** Opções do modal a partir do estado do playground. */
function optionsFrom(state) {
  const danger = state.tone === 'danger';
  const actions =
    state.footer === 'two'
      ? [
          { label: 'Cancelar', value: 'cancel', autofocus: danger },
          { label: danger ? 'Excluir' : 'Publicar', value: 'confirm', variant: danger ? 'danger' : 'primary' },
        ]
      : state.footer === 'one'
        ? [{ label: 'Entendi', value: 'ok', variant: 'primary' }]
        : [];
  return {
    eyebrow: state.eyebrow === 'yes' ? 'Projeto' : undefined,
    title: state.title || 'Sem título',
    body: BODIES[danger ? 'danger' : 'default'],
    size: state.size,
    tone: danger ? 'danger' : undefined,
    // sem rodapé, o × é a única saída: o modal sempre pode ser fechado
    dismissible: state.footer === 'none' ? true : state.dismiss === 'yes',
    actions,
  };
}

function inlineModal(opts) {
  return `<div class="${modalClasses(opts)} ds-modal--inline" role="presentation" inert>${modalContent({ ...opts, id: `md-prev-${Math.random().toString(36).slice(2, 7)}` })}</div>`;
}

function modalCode(state) {
  const o = optionsFrom(state);
  const lines = ["import { openModal } from './ds/js/modal.js';", '', 'const escolha = await openModal({'];
  if (o.eyebrow) lines.push(`  eyebrow: '${o.eyebrow}',`);
  lines.push(`  title: '${o.title.replace(/'/g, "\\'")}',`);
  lines.push(`  body: '${o.body}',`);
  if (o.size !== 'md') lines.push(`  size: '${o.size}',`);
  if (o.tone) lines.push(`  tone: '${o.tone}',`);
  if (!o.dismissible) lines.push('  dismissible: false,');
  if (o.actions.length) {
    lines.push('  actions: [');
    o.actions.forEach((a) => {
      const extra = [a.variant && `variant: '${a.variant}'`, a.autofocus && 'autofocus: true'].filter(Boolean).join(', ');
      lines.push(`    { label: '${a.label}', value: '${a.value}'${extra ? `, ${extra}` : ''} },`);
    });
    lines.push('  ],');
  }
  lines.push('});', '', "// escolha → valor da ação, ou undefined se fechou pelo ×, Esc ou clique fora");
  return lines.join('\n');
}

const describe = (value, actions) => {
  if (value === undefined) return 'Fechado sem escolher';
  const action = actions.find((a) => a.value === value);
  return `Escolheu: ${action?.label ?? value}`;
};

/* ───────── Página ───────── */

export default function renderModal(page) {
  const anatomy = {
    eyebrow: 'Projeto',
    title: 'Publicar alterações?',
    body: BODIES.default,
    actions: [
      { label: 'Cancelar', value: 'cancel' },
      { label: 'Publicar', value: 'confirm', variant: 'primary' },
    ],
  };
  const danger = {
    title: 'Excluir “Lançamento 0.1”?',
    body: BODIES.danger,
    tone: 'danger',
    size: 'sm',
    actions: [
      { label: 'Cancelar', value: 'cancel' },
      { label: 'Excluir projeto', value: 'confirm', variant: 'danger' },
    ],
  };

  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Modal</h1>
        <p class="doc-header__lead">Interrompe o fluxo para uma decisão ou uma tarefa curta. Use pouco: tudo o que pode ficar na página, fica na página.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">${SIZES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tons</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">fecha com</dt><dd class="doc-stat__value">Esc</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">base</dt><dd class="doc-stat__value">&lt;dialog&gt;</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${[
        ['playground', 'Playground'],
        ['anatomia', 'Anatomia'],
        ['tamanhos', 'Tamanhos'],
        ['confirmacao', 'Confirmação'],
        ['comportamento', 'Comportamento'],
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
          <p class="doc-section__desc">A prévia acompanha as escolhas. “Abrir de verdade” mostra o modal sobre a página, com foco, Esc e clique fora funcionando.</p>
        </div>
      </header>
      ${playgroundMarkup('modal')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="anatomia-title">Anatomia</h2>
          <p class="doc-section__desc">Cinco partes. Título e ao menos uma saída são obrigatórios; o resto depende da decisão.</p>
        </div>
      </header>
      <div class="md-anatomy">
        <div class="md-anatomy__stage" aria-hidden="true">
          <div class="md-anatomy__page"><i></i><i></i><i></i><i></i></div>
          <span class="md-anatomy__pin md-anatomy__pin--backdrop">5</span>
          <div class="md-anatomy__modal">
            ${inlineModal(anatomy)}
            <span class="md-anatomy__pin md-anatomy__pin--header">1</span>
            <span class="md-anatomy__pin md-anatomy__pin--close">2</span>
            <span class="md-anatomy__pin md-anatomy__pin--body">3</span>
            <span class="md-anatomy__pin md-anatomy__pin--footer">4</span>
          </div>
        </div>
        <ol class="md-anatomy__legend" role="list">
          <li><span class="md-anatomy__num">1</span><div><p class="md-anatomy__title">Cabeçalho</p><p class="md-anatomy__text">Rótulo opcional e título em <code class="ds-inline-code">text.heading-lg</code>. O título é a pergunta: “Publicar alterações?”.</p></div></li>
          <li><span class="md-anatomy__num">2</span><div><p class="md-anatomy__title">Fechar</p><p class="md-anatomy__text">Botão de ícone com <code class="ds-inline-code">aria-label</code>. Some quando o modal exige uma escolha (<code class="ds-inline-code">dismissible: false</code>).</p></div></li>
          <li><span class="md-anatomy__num">3</span><div><p class="md-anatomy__title">Corpo</p><p class="md-anatomy__text">Texto em <code class="ds-inline-code">text.body-md</code> e cor secundária. Se crescer, só o corpo rola — cabeçalho e ações ficam no lugar.</p></div></li>
          <li><span class="md-anatomy__num">4</span><div><p class="md-anatomy__title">Rodapé</p><p class="md-anatomy__text">Ações à direita, a principal por último. No celular elas empilham, com a principal em cima.</p></div></li>
          <li><span class="md-anatomy__num">5</span><div><p class="md-anatomy__title">Fundo</p><p class="md-anatomy__text"><code class="ds-inline-code">color.bg.overlay</code>, chapado e sem desfoque. A página continua visível — e fica inerte até o modal fechar.</p></div></li>
        </ol>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tamanhos-title">Tamanhos</h2>
          <p class="doc-section__desc">A largura acompanha o conteúdo, nunca a tela. No celular todos ocupam a largura disponível.</p>
        </div>
      </header>
      <div class="md-sizes">
        ${SIZES.map(
          ([id, name, px, text]) => `<article class="md-size">
            <div class="md-size__ruler" aria-hidden="true">
              <span class="md-size__bar" style="width:${Math.round((px / 720) * 100)}%"><span>${px} px</span></span>
            </div>
            <div class="md-size__body">
              <p class="cd-example__name">${name}${id === 'md' ? ' <span class="md-size__default">padrão</span>' : ''}<code>${id === 'md' ? '—' : `size: '${id}'`}</code></p>
              <p class="cd-example__text">${text}</p>
              <button type="button" class="ds-btn ds-btn--secondary ds-btn--sm md-size__open" data-open-size="${id}">${icon('arrow-up-right', { size: 16 })}Abrir</button>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="confirmacao" aria-labelledby="confirmacao-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="confirmacao-title">Confirmação destrutiva</h2>
          <p class="doc-section__desc">Para o que não tem volta. O tom de perigo muda o ícone e a ação — e o foco começa em “Cancelar”.</p>
        </div>
      </header>
      <div class="md-confirm">
        <div class="md-confirm__preview" aria-hidden="true">${inlineModal(danger)}</div>
        <div class="md-confirm__rules">
          <ul class="md-rules" role="list">
            <li>${icon('check', { size: 16 })}<span>Título com o objeto: “Excluir ‘Lançamento 0.1’?”, nunca “Tem certeza?”.</span></li>
            <li>${icon('check', { size: 16 })}<span>O corpo diz a consequência e se dá para desfazer.</span></li>
            <li>${icon('check', { size: 16 })}<span>O botão repete o verbo: “Excluir projeto”, não “Sim”.</span></li>
            <li>${icon('check', { size: 16 })}<span>Foco inicial na saída segura, para Enter não apagar nada por engano.</span></li>
          </ul>
          ${codeBlock("const ok = await confirmModal({\n  title: 'Excluir “Lançamento 0.1”?',\n  body: 'O projeto e os 12 arquivos dele serão apagados.',\n  confirmLabel: 'Excluir projeto',\n  tone: 'danger',\n}); // → true ou false")}
          <button type="button" class="ds-btn ds-btn--danger" data-open-confirm>${icon('trash', { size: 18 })}Excluir projeto…</button>
        </div>
      </div>
    </section>

    <section class="doc-section" id="comportamento" aria-labelledby="comportamento-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="comportamento-title">Comportamento</h2>
          <p class="doc-section__desc">O &lt;dialog&gt; nativo resolve foco e camadas. O componente cuida do resto.</p>
        </div>
      </header>
      <div class="md-behaviors">
        ${[
          ['zap', 'Foco inicial', 'Vai para o primeiro campo do corpo; sem campos, para a ação principal (ou para “Cancelar”, no tom de perigo).', ['form', 'Abrir com formulário']],
          ['x', 'Três saídas', 'Esc, clique fora e o botão ×. Com <code class="ds-inline-code">dismissible: false</code>, só as ações fecham.', null],
          ['arrow-left', 'Foco devolvido', 'Ao fechar, o foco volta para quem abriu o modal — a pessoa continua de onde estava.', null],
          ['list', 'Conteúdo longo', 'O modal nunca passa da altura da tela: o corpo rola, cabeçalho e rodapé ficam fixos.', ['long', 'Abrir com texto longo']],
          ['motion', 'Movimento', 'Entra em <code class="ds-inline-code">duration.base</code> + emphasized e sai em <code class="ds-inline-code">duration.fast</code> + accelerate. Com movimento reduzido, aparece direto.', null],
          ['layers', 'Uma camada só', 'Nada de modal sobre modal. Se a tarefa pede um segundo passo, ele acontece dentro do mesmo modal.', null],
        ]
          .map(
            ([glyph, title, text, demo]) => `<article class="md-behavior">
              <span class="md-behavior__icon">${icon(glyph, { size: 18 })}</span>
              <p class="md-behavior__title">${title}</p>
              <p class="md-behavior__text">${text}</p>
              ${demo ? `<button type="button" class="ds-inline-action md-behavior__demo" data-open-demo="${demo[0]}">${icon('arrow-up-right', { size: 16 })}${demo[1]}</button>` : ''}
            </article>`,
          )
          .join('')}
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="a11y-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="a11y-title">Acessibilidade</h2>
          <p class="doc-section__desc">Por ser um &lt;dialog&gt; aberto com showModal, o navegador já anuncia, prende o foco e deixa o resto da página inerte.</p>
        </div>
      </header>
      ${a11yList([
        ['Nome e descrição', 'O título vira <code class="ds-inline-code">aria-labelledby</code> e o corpo, <code class="ds-inline-code">aria-describedby</code> — o leitor de tela lê os dois ao abrir.'],
        ['Teclado', 'Tab circula só dentro do modal; Esc fecha (quando permitido).', ['Tab', 'Shift Tab', 'Esc']],
        ['Foco preso e devolvido', 'Ninguém se perde atrás do fundo. Ao fechar, o foco volta ao gatilho.'],
        ['Fechar com nome', 'O × tem <code class="ds-inline-code">aria-label="Fechar"</code>. Troque com <code class="ds-inline-code">closeLabel</code> se o contexto pedir.'],
        ['Sem armadilha', 'Todo modal tem uma saída por teclado. Sem rodapé, o × é obrigatório.'],
        ['Movimento reduzido', 'Com <code class="ds-inline-code">prefers-reduced-motion</code>, o modal aparece e some sem animação.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="tokens-title">Tokens usados</h2>
          <p class="doc-section__desc">Superfície elevada, fundo chapado e movimento curto.</p>
        </div>
      </header>
      ${tokenTable([
        ['color.bg.raised', 'Fundo do modal'],
        ['color.border.subtle', 'Borda'],
        ['radius.2xl', 'Raio'],
        ['shadow.2xl', 'Sombra'],
        ['color.bg.overlay', 'Fundo da página por trás'],
        ['text.heading-lg', 'Título'],
        ['text.body-md', 'Corpo'],
        ['color.fg.muted', 'Cor do corpo'],
        ['color.danger.subtle', 'Ícone no tom de perigo'],
        ['space.400', 'Respiro interno'],
        ['duration.base', 'Entrada'],
        ['easing.emphasized', 'Curva da entrada'],
        ['duration.fast', 'Saída'],
        ['easing.accelerate', 'Curva da saída'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      <header class="doc-section__header">
        <div>
          <h2 class="doc-section__title" id="uso-title">Uso</h2>
          <p class="doc-section__desc">Antes de abrir um modal, pergunte se a página não resolve.</p>
        </div>
      </header>
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: decisões que bloqueiam</p>
          <p class="usage-card__text">Confirmar algo irreversível, escolher antes de seguir, uma tarefa de um passo só.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: modal para avisar</p>
          <p class="usage-card__text">“Salvo com sucesso” não precisa parar ninguém — use um toast. E nunca abra um modal sobre outro.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Título pergunta, botão responde</p>
          <p class="usage-card__text">“Excluir projeto?” → “Excluir projeto”. Dá para decidir lendo só o título e o botão.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  let current = null;
  let alive = true;

  const unmountPlayground = mountPlayground(root, {
    id: 'modal',
    controls: [
      { id: 'size', label: 'Tamanho', value: 'md', options: SIZES.map(([value, label]) => ({ value, label })) },
      { id: 'tone', label: 'Tom', value: 'default', options: [{ value: 'default', label: 'Padrão' }, { value: 'danger', label: 'Perigo' }] },
      { id: 'footer', label: 'Rodapé', value: 'two', options: [{ value: 'two', label: 'Duas ações' }, { value: 'one', label: 'Uma ação' }, { value: 'none', label: 'Sem rodapé' }] },
      { id: 'dismiss', label: 'Fechar', value: 'yes', options: [{ value: 'yes', label: 'Esc, fora e ×' }, { value: 'no', label: 'Só pelas ações' }] },
      { id: 'eyebrow', label: 'Rótulo', value: 'yes', options: [{ value: 'yes', label: 'Com rótulo' }, { value: 'no', label: 'Sem rótulo' }] },
    ],
    text: { id: 'title', label: 'Título', value: 'Publicar alterações?' },
    render: (state) => {
      current = state;
      const opts = optionsFrom(state);
      return `<div class="md-pg">
        <div class="md-pg__preview" aria-hidden="true">${inlineModal(opts)}</div>
        <button type="button" class="ds-btn ds-btn--primary" data-open-playground>${icon('arrow-up-right', { size: 18 })}Abrir de verdade</button>
        ${state.footer === 'none' && state.dismiss === 'no' ? '<p class="md-pg__note">Sem rodapé, o × fica sempre — senão não haveria saída.</p>' : ''}
      </div>`;
    },
    code: modalCode,
  });

  const show = async (opts) => {
    const value = await openModal(opts);
    if (!alive) return;
    toast(describe(value, opts.actions ?? []), { tone: value === undefined ? 'neutral' : 'success', icon: value === undefined ? 'x' : undefined });
  };

  const onClick = async (event) => {
    if (event.target.closest('[data-open-playground]') && current) return show(optionsFrom(current));

    const size = event.target.closest('[data-open-size]')?.dataset.openSize;
    if (size) {
      const [, name, px] = SIZES.find(([id]) => id === size);
      return show({
        eyebrow: `${name} · ${px} px`,
        title: size === 'sm' ? 'Sair sem salvar?' : size === 'md' ? 'Convidar para o projeto' : 'Revisar alterações',
        body: size === 'lg' ? LONG_BODY.split('</p>').slice(0, 3).join('</p>') + '</p>' : BODIES.default,
        size,
        actions: [
          { label: 'Cancelar', value: 'cancel' },
          { label: 'Continuar', value: 'confirm', variant: 'primary' },
        ],
      });
    }

    if (event.target.closest('[data-open-confirm]')) {
      const ok = await confirmModal({
        title: 'Excluir “Lançamento 0.1”?',
        body: BODIES.danger,
        confirmLabel: 'Excluir projeto',
        tone: 'danger',
      });
      if (!alive) return;
      return toast(ok ? 'Projeto excluído (de mentirinha)' : 'Nada foi excluído', { tone: ok ? 'danger' : 'neutral', icon: ok ? 'trash' : 'check' });
    }

    const demo = event.target.closest('[data-open-demo]')?.dataset.openDemo;
    if (demo === 'form') {
      return show({
        eyebrow: 'Projeto',
        title: 'Renomear projeto',
        body: FORM_BODY,
        actions: [
          { label: 'Cancelar', value: 'cancel' },
          { label: 'Salvar', value: 'save', variant: 'primary' },
        ],
      });
    }
    if (demo === 'long') {
      return show({
        eyebrow: 'Histórico',
        title: 'Como funciona o histórico',
        body: LONG_BODY,
        size: 'md',
        actions: [{ label: 'Entendi', value: 'ok', variant: 'primary' }],
      });
    }
  };
  root.addEventListener('click', onClick);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    alive = false;
    root.removeEventListener('click', onClick);
    // fecha qualquer modal ainda aberto por esta página
    document.querySelectorAll('dialog.ds-modal[open]').forEach((d) => d.close());
    unmountPlayground();
    unmountCopy();
    unmountNav();
  };
}
