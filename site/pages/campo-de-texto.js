import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/campo-de-texto.css'];

/* ───────── Dados ───────── */

const SIZES = [
  ['sm', 'Pequeno', 32, 'Filtros e barras densas.'],
  ['md', 'Médio', 40, 'Padrão de formulário.'],
  ['lg', 'Grande', 48, 'Telas de toque e formulários curtos de destaque.'],
];

const STATES = [
  ['default', 'Padrão', 'Contorno discreto; o rótulo identifica o campo.'],
  ['hover', 'Hover', 'O contorno fica mais forte.'],
  ['focus', 'Foco', 'Contorno na cor de foco e um halo suave.'],
  ['readonly', 'Somente leitura', 'Fundo rebaixado: dá para ler e copiar, não para editar.'],
  ['disabled', 'Desativado', 'Opacidade reduzida e fora da ordem de foco.'],
  ['invalid', 'Inválido', 'Contorno e mensagem de perigo, ligados por aria-describedby.'],
];

const ICONS = [
  ['none', 'Sem ícone'],
  ['search', 'Busca à esquerda'],
  ['mail', 'E-mail à esquerda'],
  ['clear', 'Limpar à direita'],
];

const COUNTER_MAX = 40;

/* ───────── Campo (playground, exemplos e código) ───────── */

function field(o) {
  const id = o.id;
  const sizeClass = o.size && o.size !== 'md' ? ` ds-field--${o.size}` : '';
  const forced = ['hover', 'focus'].includes(o.state) ? ` data-state="${o.state}"` : '';
  const invalid = o.state === 'invalid';
  const describedBy = [o.hint && !invalid && `${id}-hint`, invalid && `${id}-error`].filter(Boolean).join(' ');
  const value = o.state === 'readonly' ? o.value || 'orbita-design-system' : o.value || '';
  const attrs = [
    `class="ds-field__input"`,
    `id="${id}"`,
    `type="${o.type ?? 'text'}"`,
    o.placeholder && `placeholder="${escapeHtml(o.placeholder)}"`,
    value && `value="${escapeHtml(value)}"`,
    o.state === 'disabled' && 'disabled',
    o.state === 'readonly' && 'readonly',
    invalid && 'aria-invalid="true"',
    describedBy && `aria-describedby="${describedBy}"`,
    o.counter && `maxlength="${COUNTER_MAX}"`,
    o.inert && 'tabindex="-1"',
  ].filter(Boolean);
  const lead = o.icon === 'search' || o.icon === 'mail' ? icon(o.icon, { size: o.size === 'sm' ? 16 : 18 }) : '';
  const clear =
    o.icon === 'clear'
      ? `<button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" aria-label="Limpar"${o.inert ? ' tabindex="-1"' : ''}>${icon('x', { size: 16 })}</button>`
      : '';
  const footer =
    invalid || o.hint || o.counter
      ? `<div class="ds-form-field__footer">
          ${invalid ? `<p class="ds-form-field__error" id="${id}-error">${icon('alert-circle', { size: 16 })}<span>${escapeHtml(o.error || 'Use só letras, números e hífen.')}</span></p>` : ''}
          ${!invalid && o.hint ? `<p class="ds-form-field__hint" id="${id}-hint">${escapeHtml(o.hint)}</p>` : ''}
          ${o.counter ? `<span class="ds-form-field__counter" data-counter-for="${id}">${value.length}/${COUNTER_MAX}</span>` : ''}
        </div>`
      : '';
  return `<div class="ds-form-field${o.className ? ` ${o.className}` : ''}">
    <label class="ds-form-field__label" for="${id}">${escapeHtml(o.label || 'Rótulo')}${o.optional ? '<span class="ds-form-field__optional">opcional</span>' : ''}</label>
    <div class="ds-field${sizeClass}"${forced}>${lead}<input ${attrs.join(' ')}>${clear}</div>
    ${footer}
  </div>`;
}

function fieldCode(s) {
  const id = 'nome-projeto';
  const sizeClass = s.size !== 'md' ? ` ds-field--${s.size}` : '';
  const invalid = s.state === 'invalid';
  const describedBy = [s.hint === 'on' && !invalid && `${id}-dica`, invalid && `${id}-erro`].filter(Boolean).join(' ');
  const inputAttrs = [
    `class="ds-field__input"`,
    `id="${id}"`,
    `type="text"`,
    `placeholder="Ex.: Órbita"`,
    s.state === 'disabled' && 'disabled',
    s.state === 'readonly' && 'readonly value="orbita-design-system"',
    invalid && 'aria-invalid="true"',
    describedBy && `aria-describedby="${describedBy}"`,
    s.counter === 'on' && `maxlength="${COUNTER_MAX}"`,
  ].filter(Boolean);
  const lines = [`<div class="ds-form-field">`, `  <label class="ds-form-field__label" for="${id}">${s.label || 'Rótulo'}</label>`, `  <div class="ds-field${sizeClass}">`];
  if (s.icon === 'search' || s.icon === 'mail') lines.push(`    <ds-icon name="${s.icon}" size="18"></ds-icon>`);
  lines.push(`    <input ${inputAttrs.join(' ')}>`);
  if (s.icon === 'clear') lines.push(`    <button type="button" class="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted ds-field__action" aria-label="Limpar">`, `      <ds-icon name="x" size="16"></ds-icon>`, `    </button>`);
  lines.push(`  </div>`);
  if (invalid || s.hint === 'on' || s.counter === 'on') {
    lines.push(`  <div class="ds-form-field__footer">`);
    if (invalid) lines.push(`    <p class="ds-form-field__error" id="${id}-erro">Use só letras, números e hífen.</p>`);
    else if (s.hint === 'on') lines.push(`    <p class="ds-form-field__hint" id="${id}-dica">Aparece no menu e na busca.</p>`);
    if (s.counter === 'on') lines.push(`    <span class="ds-form-field__counter">0/${COUNTER_MAX}</span>`);
    lines.push(`  </div>`);
  }
  lines.push(`</div>`);
  return lines.join('\n');
}

/* ───────── Página ───────── */

const NAV = [
  ['playground', 'Playground'],
  ['anatomia', 'Anatomia'],
  ['tamanhos', 'Tamanhos'],
  ['estados', 'Estados'],
  ['multilinha', 'Multilinha'],
  ['validacao', 'Validação'],
  ['acessibilidade', 'Acessibilidade'],
  ['tokens', 'Tokens'],
  ['uso', 'Uso'],
];

const sectionHead = (id, title, desc, aside = '') => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>${aside}
</header>`;

export default function renderCampoDeTexto(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Campo de texto</h1>
        <p class="doc-header__lead">Para a pessoa escrever. Rótulo sempre visível, dica antes do erro e mensagens que dizem como resolver.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">tamanhos</dt><dd class="doc-stat__value">${SIZES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">formatos</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">altura padrão</dt><dd class="doc-stat__value">40 px</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', 'Monte o campo, veja nos dois temas e copie o código. O campo do palco funciona: digite para ver o contador.')}
      ${playgroundMarkup('campo')}
    </section>

    <section class="doc-section" id="anatomia" aria-labelledby="anatomia-title">
      ${sectionHead('anatomia', 'Anatomia', 'Seis partes; só rótulo e contêiner são obrigatórios.')}
      <div class="tf-anatomy">
        <div class="tf-anatomy__stage" aria-hidden="true" inert>
          <div class="ds-form-field tf-anatomy__field">
            <span class="ds-form-field__label tf-anatomy__part" data-num="1">E-mail de trabalho</span>
            <div class="ds-field tf-anatomy__part" data-num="2">
              <span class="tf-anatomy__part tf-anatomy__part--inline" data-num="3">${icon('mail', { size: 18 })}</span>
              <span class="tf-anatomy__part tf-anatomy__part--grow ds-field__placeholder" data-num="4">nome@empresa.com</span>
            </div>
            <div class="ds-form-field__footer">
              <span class="ds-form-field__hint tf-anatomy__part" data-num="5">Vamos usar para avisos da conta.</span>
              <span class="ds-form-field__counter tf-anatomy__part" data-num="6">0/40</span>
            </div>
          </div>
        </div>
        <ol class="tf-anatomy__legend" role="list">
          ${[
            ['Rótulo', 'Sempre visível, acima do campo, em <code class="ds-inline-code">text.label-md</code>. Marque o que é <em>opcional</em> — não o obrigatório.'],
            ['Contêiner', 'Altura <code class="ds-inline-code">size.control.*</code>, contorno <code class="ds-inline-code">border.control</code>, raio <code class="ds-inline-code">radius.md</code>.'],
            ['Ícone', 'Opcional. Só quando ajuda a reconhecer o tipo de dado — busca, e-mail, data.'],
            ['Texto e placeholder', 'O placeholder dá um exemplo do formato; nunca substitui o rótulo.'],
            ['Dica ou erro', 'Uma linha logo abaixo. O erro ocupa o lugar da dica e diz como resolver.'],
            ['Contador', 'Só quando existe limite. Fica vermelho ao passar do máximo.'],
          ]
            .map(([title, text], i) => `<li><span class="tf-anatomy__num">${i + 1}</span><div><p class="tf-anatomy__title">${title}</p><p class="tf-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>
    </section>

    <section class="doc-section" id="tamanhos" aria-labelledby="tamanhos-title">
      ${sectionHead('tamanhos', 'Tamanhos', 'Dentro de um <code class="ds-inline-code">.ds-form-field</code> o padrão é o médio. Use o mesmo tamanho dos botões ao lado.')}
      <div class="tf-sizes">
        ${SIZES.map(
          ([id, name, h, text]) => `<article class="tf-size">
            <div class="tf-size__preview" inert>${field({ id: `tf-size-${id}`, label: name, size: id, icon: 'search', placeholder: 'Buscar', inert: true })}</div>
            <div class="tf-size__body">
              <p class="cd-example__name">${name}<code>${id === 'md' ? 'padrão' : `ds-field--${id}`}</code></p>
              <p class="cd-example__text">${h} px · ${text}</p>
            </div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', 'Estados', 'Hover e foco também podem ser forçados com <code class="ds-inline-code">data-state</code> no <code class="ds-inline-code">.ds-field</code>, para documentar e testar.')}
      <div class="cd-grid tf-states">
        ${STATES.map(
          ([id, name, text]) => `<article class="cd-example">
            <div class="cd-example__preview tf-states__preview" inert>
              ${field({ id: `tf-state-${id}`, label: 'Slug do projeto', state: id, placeholder: 'orbita-ds', value: id === 'invalid' ? 'Órbita DS!' : '', inert: true })}
            </div>
            <div class="cd-example__body"><p class="cd-example__name">${name}</p><p class="cd-example__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
    </section>

    <section class="doc-section" id="multilinha" aria-labelledby="multilinha-title">
      ${sectionHead('multilinha', 'Multilinha', 'Para textos de mais de uma frase. Mesmo contêiner, com <code class="ds-inline-code">.ds-field--multiline</code> e um <code class="ds-inline-code">&lt;textarea&gt;</code> que cresce na vertical.')}
      <div class="tf-split">
        <div class="tf-split__demo">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="tf-bio">Descrição do projeto<span class="ds-form-field__optional">opcional</span></label>
            <div class="ds-field ds-field--multiline">
              <textarea class="ds-field__input" id="tf-bio" rows="4" maxlength="200" aria-describedby="tf-bio-hint" placeholder="Conte em poucas linhas para que serve.">Um design system plano e calmo, com tokens em OKLCH.</textarea>
            </div>
            <div class="ds-form-field__footer">
              <p class="ds-form-field__hint" id="tf-bio-hint">Aparece no topo da página do projeto.</p>
              <span class="ds-form-field__counter" data-counter-for="tf-bio">0/200</span>
            </div>
          </div>
        </div>
        <div class="tf-split__code">${codeBlock('<div class="ds-field ds-field--multiline">\n  <textarea class="ds-field__input" id="descricao" rows="4"></textarea>\n</div>')}</div>
      </div>
    </section>

    <section class="doc-section" id="validacao" aria-labelledby="validacao-title">
      ${sectionHead('validacao', 'Validação', 'Valide quando a pessoa sai do campo ou envia — nunca a cada tecla. A mensagem troca a dica e diz o que fazer.')}
      <form class="tf-validate" novalidate data-validate>
        <div class="tf-validate__fields">
          <div class="ds-form-field">
            <label class="ds-form-field__label" for="tf-email">E-mail de trabalho</label>
            <div class="ds-field">${icon('mail', { size: 18 })}<input class="ds-field__input" id="tf-email" type="email" autocomplete="email" placeholder="nome@empresa.com" aria-describedby="tf-email-msg"></div>
            <div class="ds-form-field__footer"><p class="ds-form-field__hint" id="tf-email-msg" data-msg>Vamos usar para avisos da conta.</p></div>
          </div>
        </div>
        <div class="tf-validate__actions">
          <button type="submit" class="ds-btn ds-btn--primary">Continuar</button>
          <button type="reset" class="ds-btn ds-btn--ghost">Limpar</button>
        </div>
      </form>
      <div class="tf-messages">
        <div class="tf-message tf-message--dont"><p class="tf-message__head">${icon('x-circle', { size: 18 })}Evite</p><p class="tf-message__text">“E-mail inválido.”</p></div>
        <div class="tf-message tf-message--do"><p class="tf-message__head">${icon('check-circle', { size: 18 })}Prefira</p><p class="tf-message__text">“Use um e-mail completo, como nome@empresa.com.”</p></div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', 'Acessibilidade', 'O que garante que todo mundo consiga preencher.')}
      ${a11yList([
        ['Rótulo de verdade', '<code class="ds-inline-code">&lt;label for&gt;</code> ligado ao <code class="ds-inline-code">id</code> do campo. Clicar no rótulo foca o campo; o leitor de tela anuncia o nome.'],
        ['Placeholder não é rótulo', 'Some ao digitar e tem contraste menor. Use só como exemplo de formato.'],
        ['Dica e erro anunciados', '<code class="ds-inline-code">aria-describedby</code> aponta para a dica ou para o erro, e o campo inválido ganha <code class="ds-inline-code">aria-invalid="true"</code>.'],
        ['Erro não depende só da cor', 'A mensagem tem ícone e texto, além do contorno vermelho.'],
        ['Teclado', 'Tab entra, Shift + Tab volta; nada prende o foco dentro do campo.', ['Tab', 'Shift + Tab']],
        ['Preenchimento automático', 'Use <code class="ds-inline-code">type</code> e <code class="ds-inline-code">autocomplete</code> certos (email, name, tel) para o navegador e os gerenciadores ajudarem.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', 'Tokens usados', 'Tudo o que o campo consome.')}
      ${tokenTable([
        ['size.control.md', 'Altura (médio)'],
        ['radius.md', 'Raio'],
        ['text.label-md', 'Rótulo'],
        ['text.body-sm', 'Texto digitado, dica e erro'],
        ['space.075', 'Rótulo → campo → dica'],
        ['color.border.control', 'Contorno'],
        ['color.border.strong', 'Contorno no hover'],
        ['color.border.focus', 'Contorno e halo no foco'],
        ['color.fg.subtle', 'Placeholder, ícone e dica'],
        ['color.bg.sunken', 'Fundo somente leitura'],
        ['color.danger.solid', 'Contorno inválido'],
        ['color.danger.fg', 'Mensagem de erro'],
        ['duration.fast', 'Transição do contorno'],
        ['opacity.disabled', 'Desativado'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', 'Uso', 'Três regras para formulários que não dão trabalho.')}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: rótulo em cima, dica embaixo</p>
          <div class="tf-usage" inert>${field({ id: 'tf-do', label: 'Nome completo', placeholder: 'Ex.: Ana Souza', hint: 'Como aparece nos documentos.', inert: true })}</div>
          <p class="usage-card__text">A pessoa sabe o que escrever antes de começar.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: placeholder no lugar do rótulo</p>
          <div class="tf-usage" inert><div class="ds-field ds-field--md"><input class="ds-field__input" placeholder="Nome completo" tabindex="-1" aria-label="Nome completo"></div></div>
          <p class="usage-card__text">Ao digitar, o “rótulo” some — e com ele, o contexto.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Tamanho conta o que cabe</p>
          <div class="tf-usage tf-usage--row" inert>
            <div class="ds-field ds-field--md tf-usage__short"><input class="ds-field__input" placeholder="00000-000" tabindex="-1" aria-label="CEP"></div>
            <div class="ds-field ds-field--md"><input class="ds-field__input" placeholder="Rua, número" tabindex="-1" aria-label="Endereço"></div>
          </div>
          <p class="usage-card__text">Um CEP curto num campo curto já explica o formato.</p>
        </article>
      </div>
    </section>
  </div>`;
}

/* ───────── Comportamento ───────── */

function syncCounters(scope) {
  scope.querySelectorAll('[data-counter-for]').forEach((counter) => {
    const input = scope.querySelector(`#${counter.dataset.counterFor}`);
    if (!input) return;
    const max = Number(input.getAttribute('maxlength')) || COUNTER_MAX;
    counter.textContent = `${input.value.length}/${max}`;
    counter.toggleAttribute('data-over', input.value.length >= max);
  });
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'campo',
    controls: [
      { id: 'size', label: 'Tamanho', value: 'md', options: SIZES.map(([value, label]) => ({ value, label })) },
      { id: 'icon', label: 'Ícone', value: 'none', options: ICONS.map(([value, label]) => ({ value, label })) },
      { id: 'state', label: 'Estado', value: 'default', options: STATES.map(([value, label]) => ({ value, label })) },
      { id: 'hint', label: 'Dica', value: 'on', options: [{ value: 'on', label: 'Com dica' }, { value: 'off', label: 'Sem dica' }] },
      { id: 'counter', label: 'Contador', value: 'off', options: [{ value: 'off', label: 'Sem contador' }, { value: 'on', label: 'Com contador' }] },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Nome do projeto' },
    render: (s) =>
      `<div class="tf-stage">${field({
        id: 'tf-playground',
        label: s.label,
        size: s.size,
        icon: s.icon,
        state: s.state,
        hint: s.hint === 'on' ? 'Aparece no menu e na busca.' : '',
        counter: s.counter === 'on',
        placeholder: 'Ex.: Órbita',
        value: s.state === 'invalid' ? 'Órbita DS!' : '',
      })}</div>`,
    code: fieldCode,
  });

  // contadores ao vivo (playground e multilinha)
  const onInput = (event) => {
    if (event.target.matches?.('.ds-field__input')) syncCounters(root);
  };
  root.addEventListener('input', onInput);
  syncCounters(root);

  // botão "limpar" dentro do campo
  const onClick = (event) => {
    const clear = event.target.closest('.ds-field__action');
    if (!clear) return;
    const input = clear.parentElement.querySelector('.ds-field__input');
    input.value = '';
    input.focus();
    syncCounters(root);
  };
  root.addEventListener('click', onClick);

  // validação no envio e ao sair do campo
  const form = root.querySelector('[data-validate]');
  const email = form.querySelector('#tf-email');
  const msg = form.querySelector('[data-msg]');
  const HINT = 'Vamos usar para avisos da conta.';
  const validate = () => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    email.setAttribute('aria-invalid', String(!ok));
    msg.className = ok ? 'ds-form-field__hint' : 'ds-form-field__error';
    msg.innerHTML = ok ? 'Tudo certo.' : `${icon('alert-circle', { size: 16 })}<span>Use um e-mail completo, como nome@empresa.com.</span>`;
    return ok;
  };
  const onSubmit = (event) => {
    event.preventDefault();
    if (!validate()) email.focus();
  };
  const onBlur = () => email.value && validate();
  const onReset = () => {
    email.removeAttribute('aria-invalid');
    msg.className = 'ds-form-field__hint';
    msg.textContent = HINT;
  };
  form.addEventListener('submit', onSubmit);
  form.addEventListener('reset', onReset);
  email.addEventListener('blur', onBlur);

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  // o playground recria o campo a cada mudança: mantém o contador em dia
  const preview = root.querySelector('[data-playground="campo"] [data-preview]');
  const observer = new MutationObserver(() => syncCounters(root));
  observer.observe(preview, { childList: true });

  return () => {
    unmountPlayground();
    unmountCopy();
    unmountNav();
    observer.disconnect();
    root.removeEventListener('input', onInput);
    root.removeEventListener('click', onClick);
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('reset', onReset);
    email.removeEventListener('blur', onBlur);
  };
}
