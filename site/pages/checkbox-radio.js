import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/checkbox-radio.css'];

/* ───────── Dados ───────── */

const STATES = [
  ['unchecked', 'Desmarcado'],
  ['checked', 'Marcado'],
  ['indeterminate', 'Indeterminado'],
  ['hover', 'Hover'],
  ['focus', 'Foco'],
  ['disabled', 'Desativado'],
  ['invalid', 'Inválido'],
];

let uid = 0;

/* ───────── Controle (playground, exemplos e código) ───────── */

function choice(o) {
  const kind = o.kind === 'radio' ? 'radio' : 'checkbox';
  const state = kind === 'radio' && o.state === 'indeterminate' ? 'unchecked' : o.state;
  const id = o.id ?? `cr-${++uid}`;
  const attrs = [
    `type="${kind}"`,
    `class="ds-${kind}__input"`,
    `id="${id}"`,
    o.name && `name="${o.name}"`,
    o.value && `value="${escapeHtml(o.value)}"`,
    (state === 'checked' || o.checked) && 'checked',
    state === 'disabled' && 'disabled',
    state === 'invalid' && 'aria-invalid="true"',
    state === 'indeterminate' && 'data-indeterminate',
    ['hover', 'focus'].includes(state) && `data-state="${state}"`,
    o.inert && 'tabindex="-1"',
    o.extra,
  ].filter(Boolean);
  const description = o.description ? `<span class="ds-choice__description">${escapeHtml(o.description)}</span>` : '';
  return `<label class="ds-${kind}">
    <input ${attrs.join(' ')}>
    <span class="ds-choice__text"><span class="ds-choice__label">${escapeHtml(o.label)}</span>${description}</span>
  </label>`;
}

function choiceCode(s) {
  const kind = s.kind === 'radio' ? 'radio' : 'checkbox';
  const state = kind === 'radio' && s.state === 'indeterminate' ? 'unchecked' : s.state;
  const attrs = [
    `type="${kind}"`,
    `class="ds-${kind}__input"`,
    kind === 'radio' && 'name="plano"',
    state === 'checked' && 'checked',
    state === 'disabled' && 'disabled',
    state === 'invalid' && 'aria-invalid="true" aria-describedby="erro-termos"',
  ].filter(Boolean);
  const lines = [`<label class="ds-${kind}">`, `  <input ${attrs.join(' ')}>`, `  <span class="ds-choice__text">`, `    <span class="ds-choice__label">${s.label || 'Rótulo'}</span>`];
  if (s.description === 'on') lines.push(`    <span class="ds-choice__description">Uma vez por mês, sem spam.</span>`);
  lines.push(`  </span>`, `</label>`);
  if (state === 'indeterminate') lines.push('', `<!-- indeterminado só existe via JavaScript -->`, `<script>input.indeterminate = true;</script>`);
  return lines.join('\n');
}

/** :indeterminate não tem atributo: aplica a propriedade em quem pediu. */
function applyIndeterminate(scope) {
  scope.querySelectorAll('input[data-indeterminate]').forEach((input) => (input.indeterminate = true));
}

/* ───────── Página ───────── */

const NAV = [
  ['playground', 'Playground'],
  ['qual', 'Checkbox ou radio'],
  ['estados', 'Estados'],
  ['grupos', 'Grupos'],
  ['todos', 'Selecionar todos'],
  ['acessibilidade', 'Acessibilidade'],
  ['tokens', 'Tokens'],
  ['uso', 'Uso'],
];

const sectionHead = (id, title, desc) => `<header class="doc-section__header">
  <div><h2 class="doc-section__title" id="${id}-title">${title}</h2><p class="doc-section__desc">${desc}</p></div>
</header>`;

const TEAM = ['Ana Souza', 'Bruno Lima', 'Carla Dias'];

export default function renderCheckboxRadio(page) {
  return `
  <div class="page doc">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Checkbox e radio</h1>
        <p class="doc-header__lead">Checkbox para marcar itens independentes; radio para escolher um só entre poucas opções. Os dois com rótulo clicável.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">controles</dt><dd class="doc-stat__value">2</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">estados</dt><dd class="doc-stat__value">${STATES.length}</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tamanho</dt><dd class="doc-stat__value">18 px</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">área de clique</dt><dd class="doc-stat__value">rótulo</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    <section class="doc-section" id="playground" aria-labelledby="playground-title">
      ${sectionHead('playground', 'Playground', 'Inputs nativos com aparência própria. O do palco funciona — clique no rótulo.')}
      ${playgroundMarkup('escolha')}
    </section>

    <section class="doc-section" id="qual" aria-labelledby="qual-title">
      ${sectionHead('qual', 'Checkbox ou radio?', 'A pergunta é uma só: dá para marcar mais de uma opção?')}
      <div class="cr-compare">
        <article class="cr-compare__card">
          <div class="cr-compare__stage">
            <fieldset class="ds-choice-group">
              <legend class="ds-choice-group__legend">Avisar por</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', id: 'cr-q-email', label: 'E-mail', checked: true })}
                ${choice({ kind: 'checkbox', id: 'cr-q-push', label: 'Notificação no celular', checked: true })}
                ${choice({ kind: 'checkbox', id: 'cr-q-sms', label: 'SMS' })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Checkbox<code>ds-checkbox</code></p><p class="cd-example__text">Várias, nenhuma ou todas. Cada uma vale sozinha.</p></div>
        </article>
        <article class="cr-compare__card">
          <div class="cr-compare__stage">
            <fieldset class="ds-choice-group">
              <legend class="ds-choice-group__legend">Plano</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'radio', id: 'cr-q-mensal', name: 'cr-plano', value: 'mensal', label: 'Mensal', description: 'R$ 49 por mês' })}
                ${choice({ kind: 'radio', id: 'cr-q-anual', name: 'cr-plano', value: 'anual', label: 'Anual', description: 'R$ 490 por ano — dois meses grátis', checked: true })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Radio<code>ds-radio</code></p><p class="cd-example__text">Exatamente uma. Escolher outra desmarca a anterior.</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="estados" aria-labelledby="estados-title">
      ${sectionHead('estados', 'Estados', 'Marcado usa a cor da marca; o contorno desmarcado tem contraste de 3:1 para ser visto sem depender do rótulo. Hover e foco podem ser forçados com <code class="ds-inline-code">data-state</code>.')}
      <div class="cr-states" inert>
        <div class="cr-states__grid">
          <span></span>
          ${STATES.map(([, label]) => `<span class="cr-states__head">${label}</span>`).join('')}
          ${['checkbox', 'radio']
            .map(
              (kind) => `<span class="cr-states__row">${kind === 'checkbox' ? 'Checkbox' : 'Radio'}</span>
                ${STATES.map(([state]) =>
                  kind === 'radio' && state === 'indeterminate'
                    ? '<span class="cr-states__cell cr-states__cell--na">—</span>'
                    : `<span class="cr-states__cell"><span class="ds-${kind}">${choice({ kind, state, label: '', inert: true }).match(/<input[^>]*>/)[0]}</span></span>`,
                ).join('')}`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="doc-section" id="grupos" aria-labelledby="grupos-title">
      ${sectionHead('grupos', 'Grupos', 'Opções relacionadas ficam num <code class="ds-inline-code">&lt;fieldset&gt;</code> com <code class="ds-inline-code">&lt;legend&gt;</code>: o leitor de tela anuncia a pergunta antes das respostas.')}
      <div class="cd-grid cr-groups">
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group" aria-describedby="cr-g1-hint">
              <legend class="ds-choice-group__legend">Mostrar no painel</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', label: 'Visitas', checked: true })}
                ${choice({ kind: 'checkbox', label: 'Conversões', checked: true })}
                ${choice({ kind: 'checkbox', label: 'Receita' })}
              </div>
              <p class="ds-choice-group__hint" id="cr-g1-hint">Escolha até três métricas.</p>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Vertical<code>padrão</code></p><p class="cd-example__text">Uma opção por linha — mais fácil de ler e de clicar.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group ds-choice-group--inline">
              <legend class="ds-choice-group__legend">Tema</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'radio', name: 'cr-g2', label: 'Escuro', checked: true })}
                ${choice({ kind: 'radio', name: 'cr-g2', label: 'Claro' })}
                ${choice({ kind: 'radio', name: 'cr-g2', label: 'Sistema' })}
              </div>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Em linha<code>ds-choice-group--inline</code></p><p class="cd-example__text">Para duas ou três opções curtas.</p></div>
        </article>
        <article class="cd-example">
          <div class="cd-example__preview cr-group-preview">
            <fieldset class="ds-choice-group" aria-describedby="cr-g3-error">
              <legend class="ds-choice-group__legend">Termos</legend>
              <div class="ds-choice-group__items">
                ${choice({ kind: 'checkbox', state: 'invalid', label: 'Li e aceito os termos de uso', extra: 'aria-describedby="cr-g3-error"' })}
              </div>
              <p class="ds-choice-group__error" id="cr-g3-error">${icon('alert-circle', { size: 16 })}<span>Aceite os termos para criar a conta.</span></p>
            </fieldset>
          </div>
          <div class="cd-example__body"><p class="cd-example__name">Com erro</p><p class="cd-example__text">Mensagem abaixo do grupo, ligada por <code class="ds-inline-code">aria-describedby</code>.</p></div>
        </article>
      </div>
    </section>

    <section class="doc-section" id="todos" aria-labelledby="todos-title">
      ${sectionHead('todos', 'Selecionar todos', 'O estado indeterminado só faz sentido num checkbox que resume outros: alguns marcados, outros não.')}
      <div class="cr-all">
        <div class="cr-all__demo" data-select-all>
          ${choice({ kind: 'checkbox', id: 'cr-all', label: 'Toda a equipe', description: `${TEAM.length} pessoas`, extra: 'data-parent aria-controls="cr-all-list"' })}
          <div class="cr-all__children" id="cr-all-list">
            ${TEAM.map((name, i) => choice({ kind: 'checkbox', id: `cr-all-${i}`, label: name, checked: i === 0, extra: 'data-child' })).join('')}
          </div>
        </div>
        <div class="cr-all__code">${codeBlock(`const marcados = filhos.filter((c) => c.checked).length;
pai.checked = marcados === filhos.length;
pai.indeterminate = marcados > 0 && marcados < filhos.length;`)}</div>
      </div>
    </section>

    <section class="doc-section" id="acessibilidade" aria-labelledby="acessibilidade-title">
      ${sectionHead('acessibilidade', 'Acessibilidade', 'Por baixo são inputs nativos — teclado e leitor de tela já funcionam.')}
      ${a11yList([
        ['Rótulo envolve o input', 'O <code class="ds-inline-code">&lt;label&gt;</code> inteiro é área de clique, e o nome do controle vem do texto.'],
        ['Checkbox: Espaço marca', 'Tab vai de um checkbox ao próximo; Espaço marca e desmarca.', ['Tab', 'Espaço']],
        ['Radio: setas escolhem', 'O grupo é uma parada de Tab só; as setas mudam a opção escolhida.', ['Tab', '↑', '↓']],
        ['Pergunta anunciada', 'Com <code class="ds-inline-code">&lt;fieldset&gt;</code> e <code class="ds-inline-code">&lt;legend&gt;</code>, o leitor diz “Plano, grupo” antes das opções.'],
        ['Indeterminado = “misto”', 'A propriedade <code class="ds-inline-code">indeterminate</code> é anunciada como parcialmente marcada.'],
        ['Contraste do contorno', 'O contorno desmarcado usa <code class="ds-inline-code">fg.subtle</code>: pelo menos 3:1 contra o fundo nos dois temas.'],
      ])}
    </section>

    <section class="doc-section" id="tokens" aria-labelledby="tokens-title">
      ${sectionHead('tokens', 'Tokens usados', 'Tudo o que checkbox e radio consomem.')}
      ${tokenTable([
        ['color.fg.subtle', 'Contorno desmarcado'],
        ['color.fg.muted', 'Contorno no hover'],
        ['color.brand.solid', 'Fundo marcado (checkbox) e ponto (radio)'],
        ['color.brand.solid-hover', 'Marcado no hover'],
        ['color.brand.on-solid', 'Marca de seleção'],
        ['color.border.focus', 'Anel de foco'],
        ['color.danger.solid', 'Contorno inválido'],
        ['color.danger.fg', 'Mensagem de erro'],
        ['radius.xs', 'Raio do checkbox'],
        ['radius.full', 'Radio'],
        ['text.label-md', 'Rótulo'],
        ['text.body-sm', 'Descrição'],
        ['space.150', 'Controle → texto e entre opções'],
        ['duration.fast', 'Marca aparecendo'],
      ])}
    </section>

    <section class="doc-section" id="uso" aria-labelledby="uso-title">
      ${sectionHead('uso', 'Uso', 'Três regras para escolhas claras.')}
      <div class="usage-grid">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: rótulo que se lê sozinho</p>
          <div class="cr-usage" inert>${choice({ kind: 'checkbox', label: 'Enviar resumo semanal por e-mail', checked: true, inert: true })}</div>
          <p class="usage-card__text">Marcado ou não, a frase continua fazendo sentido.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: negação no rótulo</p>
          <div class="cr-usage" inert>${choice({ kind: 'checkbox', label: 'Não deixar de enviar o resumo', inert: true })}</div>
          <p class="usage-card__text">Marcar um “não” exige parar e pensar duas vezes.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Efeito imediato? Use switch</p>
          <p class="usage-card__text">Checkbox vale ao enviar o formulário. Se a mudança acontece na hora (ligar notificações), o switch comunica melhor.</p>
        </article>
      </div>
    </section>
  </div>`;
}

export function mount(root) {
  const unmountPlayground = mountPlayground(root, {
    id: 'escolha',
    controls: [
      { id: 'kind', label: 'Tipo', value: 'checkbox', options: [{ value: 'checkbox', label: 'Checkbox' }, { value: 'radio', label: 'Radio' }] },
      { id: 'state', label: 'Estado', value: 'checked', options: STATES.map(([value, label]) => ({ value, label })) },
      { id: 'description', label: 'Descrição', value: 'on', options: [{ value: 'on', label: 'Com descrição' }, { value: 'off', label: 'Sem descrição' }] },
    ],
    text: { id: 'label', label: 'Rótulo', value: 'Receber novidades' },
    render: (s) =>
      choice({
        kind: s.kind,
        id: 'cr-playground',
        name: 'cr-playground',
        state: s.state,
        label: s.label || 'Rótulo',
        description: s.description === 'on' ? 'Uma vez por mês, sem spam.' : '',
      }),
    code: choiceCode,
  });

  // indeterminado: aplica agora e sempre que o playground redesenhar
  applyIndeterminate(root);
  const preview = root.querySelector('[data-playground="escolha"] [data-preview]');
  const observer = new MutationObserver(() => applyIndeterminate(preview));
  observer.observe(preview, { childList: true });

  // "selecionar todos"
  const group = root.querySelector('[data-select-all]');
  const parent = group.querySelector('[data-parent]');
  const children = [...group.querySelectorAll('[data-child]')];
  const syncParent = () => {
    const marked = children.filter((c) => c.checked).length;
    parent.checked = marked === children.length;
    parent.indeterminate = marked > 0 && marked < children.length;
  };
  const onChange = (event) => {
    if (event.target === parent) children.forEach((c) => (c.checked = parent.checked));
    syncParent();
  };
  group.addEventListener('change', onChange);
  syncParent();

  const unmountCopy = mountCodeCopy(root);
  const unmountNav = mountDocNav(root);

  return () => {
    unmountPlayground();
    observer.disconnect();
    group.removeEventListener('change', onChange);
    unmountCopy();
    unmountNav();
  };
}
