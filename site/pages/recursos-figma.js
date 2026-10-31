import { icon } from '../../ds/icons/icons.js';
import { mountDocNav } from '../doc-nav.js';
import { mountCodeCopy, codeBlock, a11yList } from '../component-doc.js';

export const styles = ['site/component-doc.css', 'site/pages/recursos-figma.css'];

const SUMMARY_URL = 'dist/figma-plugin/summary.json';

const STEPS = [
  ['Gere o plugin', 'Na pasta do projeto. Ele lê os tokens e os ícones atuais — rode de novo sempre que eles mudarem.', 'npm run figma'],
  ['Abra o Figma para desktop', 'Plugins de desenvolvimento só rodam no app. Abra o arquivo onde a biblioteca vai morar (de preferência um arquivo só para ela).', null],
  ['Importe pelo manifesto', 'Menu Plugins → Desenvolvimento → Importar plugin do manifesto… e escolha o arquivo abaixo. É uma vez só; depois ele aparece em Plugins → Desenvolvimento.', 'dist/figma-plugin/manifest.json'],
  ['Rode “Órbita para Figma”', 'Escolha o que gerar — Fundamentos, Ícones, Componentes — e os modos, e clique em Gerar no arquivo. Variáveis e estilos de texto sempre são atualizados.', null],
  ['Publique como biblioteca', 'Com tudo gerado, publique o arquivo (Recursos → Bibliotecas) para o time usar os componentes nos próprios arquivos.', null],
];

const CREATES = [
  ['layers', 'Variáveis', 'Primitivas, Semânticos (modos Escuro e Claro) e Dimensões — com aliases, escopos e o nome CSS em “código”.'],
  ['type', 'Estilos', 'Os 19 estilos de texto e as sombras, uma versão por tema (estilos do Figma não têm modos).'],
  ['shapes', 'Ícones', 'Cada ícone vira um componente de 24 px, com a cor ligada a color/fg/default.'],
  ['component', 'Componentes', 'Conjuntos de variantes com auto layout, propriedades de texto, booleano e troca de ícone — tudo ligado às variáveis.'],
];

const ANATOMY = [
  ['1', 'Cabeçalho', 'Grupo, título, descrição e tags. Escuro nos dois modos, como uma capa.'],
  ['2', 'Conjunto de variantes', 'Em matriz, com o nome das colunas e das linhas. A borda tracejada roxa é do próprio Figma.'],
  ['3', 'Exemplos', 'Instâncias montadas como na tela — com ícone, hierarquia, estados.'],
  ['4', 'Claro e Escuro', 'O mesmo exemplo em dois frames, cada um com o modo da coleção Semânticos fixado.'],
];

const PROPS = [
  ['Variantes', 'Variante, Tamanho, Estado…', 'Os valores em português, iguais aos da documentação: Primário, Secundário, Hover, Foco, Desativado.'],
  ['Texto', 'Rótulo, Valor', 'Troque o texto na instância sem desanexar.'],
  ['Booleano', 'Ícone', 'Liga e desliga partes opcionais.'],
  ['Troca de instância', 'Trocar ícone', 'Escolhe o ícone entre os preferidos, sem caçar na biblioteca.'],
];

const LIMITS = [
  ['O Figma não lê CSS', 'Cada componente é redesenhado a partir dos mesmos tokens. Quando o CSS de um componente muda, o desenho dele no plugin muda junto (figma/plugin/).'],
  ['Alguns componentes ficam mais simples', 'Tabela, gráficos e composer viram exemplos montados, sem todos os comportamentos da web.'],
  ['Fontes', 'Inter, Inter Tight e JetBrains Mono precisam estar disponíveis. Sem uma delas, o plugin usa Inter no mesmo peso e avisa no fim.'],
  ['Sombras não têm modo', 'Os estilos de sombra vêm em pares (Escuro/… e Claro/…); nos componentes, a sombra usa a cor de overlay, que tem modo.'],
  ['Plano gratuito: um modo só', 'O plano gratuito do Figma aceita um modo por coleção de variáveis. Em Modos, escolha “Só Escuro” ou “Só Claro”; quando o arquivo for para um plano pago, rode de novo com Claro e Escuro e o que já existe é atualizado, sem duplicar.'],
  ['Só no app para desktop', 'Plugins de desenvolvimento não rodam no Figma do navegador.'],
];

const CODE_BLOCK = `// figma/plugin/31-meu-componente.js
(function () {
  defineBlock({
    id: 'etiqueta',
    page: 'Componentes',
    row: 'Ações',
    order: 6,
    group: 'Ações',
    title: 'Etiqueta',
    description: 'Rótulo curto para marcar um item.',
    build: async function () {
      var set = await variants('etiqueta', 'Etiqueta', [
        { props: { Tom: 'Neutro' }, build: async function (c) {
          box(c.name, { dir: 'H', pad: [4, 'space/100'], radius: 'radius/full', fill: 'color/bg/selected' }, c);
          add(c, await text('Etiqueta', { style: 'label-sm', prop: 'Rótulo' }));
        } },
      ], { props: { 'Rótulo': ['TEXT', 'Etiqueta'] } });

      return { sections: [{ title: 'Tons', node: set }].concat(themed('Etiqueta', async function () {
        return instance(set, { Tom: 'Neutro' }, { 'Rótulo': 'Novo' });
      })) };
    },
  });
})();`;

const nav = [
  ['rf-instalar', 'Instalar'],
  ['rf-cria', 'O que cria'],
  ['rf-blocos', 'Blocos'],
  ['rf-lista', 'Componentes'],
  ['rf-atualizar', 'Rodar de novo'],
  ['rf-propriedades', 'Propriedades'],
  ['rf-testar', 'Testar sem o Figma'],
  ['rf-limites', 'Limitações'],
  ['rf-manter', 'Para quem mantém'],
];

function section(id, title, desc, body) {
  return `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div>
      <h2 class="doc-section__title" id="${id}-title">${title}</h2>
      ${desc ? `<p class="doc-section__desc">${desc}</p>` : ''}
    </div></header>
    ${body}
  </section>`;
}

export default function renderFigma(page) {
  return `
  <div class="page doc rf-page">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Plugin do Figma</h1>
        <p class="doc-header__lead">Os componentes do Órbita dentro do Figma, sem redesenhar nada: um plugin que cria variáveis, estilos, ícones e cada componente com variantes — organizados em blocos de documentação, nos modos Claro e Escuro.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">páginas no arquivo</dt><dd class="doc-stat__value" data-stat="pages">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">blocos</dt><dd class="doc-stat__value" data-stat="blocks">—</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">variantes</dt><dd class="doc-stat__value" data-stat="variants">—</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">ícones</dt><dd class="doc-stat__value" data-stat="icons">—</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${nav.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section(
      'rf-instalar',
      'Instalar',
      'Cinco passos, uma vez. Depois é só rodar o plugin de novo quando o design system mudar.',
      `<ol class="rf-steps" role="list">
        ${STEPS.map(
          ([title, text, code], i) => `<li class="rf-step">
            <p class="ds-section__head"><span class="ds-section__stamp">${String(i + 1).padStart(2, '0')}</span><span>${title}</span></p>
            <p class="rf-step__text">${text}</p>
            ${code ? codeBlock(code) : ''}
          </li>`,
        ).join('')}
      </ol>`,
    )}

    ${section(
      'rf-cria',
      'O que cria',
      'Três páginas — <strong>Órbita · Fundamentos</strong>, <strong>Órbita · Ícones</strong> e <strong>Órbita · Componentes</strong> — sobre as variáveis e os estilos do arquivo.',
      `<div class="rf-creates">
        ${CREATES.map(([ic, title, text]) => `<article class="rf-create"><span class="rf-create__icon">${icon(ic, { size: 20 })}</span><h3 class="rf-create__title">${title}</h3><p class="rf-create__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-blocos',
      'Blocos',
      'Cada componente vira um bloco de documentação, lado a lado com os outros da mesma categoria — com espaço para respirar.',
      `<div class="rf-anatomy">
        <div class="rf-mock" aria-hidden="true">
          <div class="rf-mock__head" data-num="1">
            <span class="rf-mock__eyebrow">SELEÇÃO</span>
            <span class="rf-mock__title">Seleção múltipla com busca</span>
            <span class="rf-mock__row"><span class="rf-mock__desc">Um campo que aceita várias opções, com busca no menu.</span><span class="rf-mock__tags"><i>Componente</i><i>Claro · Escuro</i></span></span>
          </div>
          <div class="rf-mock__body">
            <div class="rf-mock__sec"><b>Opção</b><span class="rf-mock__set" data-num="2"><i></i><i></i><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>Menu</b><span class="rf-mock__menu" data-num="3"><i></i><i></i><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>Claro</b><span class="rf-mock__theme" data-theme="light" data-num="4"><i></i><i></i></span></div>
            <div class="rf-mock__sec"><b>Escuro</b><span class="rf-mock__theme" data-theme="dark"><i></i><i></i></span></div>
          </div>
        </div>
        <ol class="rf-legend" role="list">
          ${ANATOMY.map(([n, title, text]) => `<li><span class="rf-legend__num">${n}</span><div><p class="rf-legend__title">${title}</p><p class="rf-legend__text">${text}</p></div></li>`).join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'rf-lista',
      'Componentes',
      'Os blocos da última geração, por página. A lista vem do teste do plugin (npm run figma:test).',
      `<div class="rf-list" data-blocks><p class="rf-list__empty">Rode <code class="ds-inline-code">npm run figma:test</code> para ver a lista aqui.</p></div>`,
    )}

    ${section(
      'rf-atualizar',
      'Rodar de novo',
      'O plugin marca tudo o que cria. Na próxima execução, ele atualiza em vez de duplicar.',
      a11yList([
        ['Componentes mantêm o id', 'O conteúdo de cada variante é refeito, mas o componente é o mesmo — instâncias espalhadas pelos seus arquivos continuam ligadas.'],
        ['Variáveis e estilos pelo nome', 'Mudou um valor no tokens/*.json? Rode npm run tokens, npm run figma e o plugin: o valor muda no Figma, sem trocar a variável.'],
        ['Blocos são refeitos', 'Cabeçalhos, exemplos e prévias são documentação: o plugin apaga e monta de novo, então não edite dentro deles.'],
        ['O que você criou fica', 'Páginas, frames e componentes que não vieram do plugin não são tocados.'],
      ]),
    )}

    ${section(
      'rf-propriedades',
      'Propriedades',
      'Para trocar o que importa na instância, sem desanexar.',
      `<div class="doc-table rf-props">
        <div class="doc-table__head" aria-hidden="true"><span>Tipo</span><span>Exemplos</span><span>Para quê</span></div>
        ${PROPS.map(([t, ex, text]) => `<div class="doc-table__row"><span class="rf-props__type">${t}</span><code class="ds-inline-code">${ex}</code><span class="rf-props__text">${text}</span></div>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-testar',
      'Testar sem o Figma',
      'O teste roda o plugin numa imitação da API do Figma, com as mesmas regras (fonte carregada antes do texto, preencher só em auto layout, propriedades válidas), roda de novo para garantir que nada duplica e gera uma prévia.',
      `${codeBlock('npm run figma:test')}
      <p class="rf-note">${icon('eye', { size: 16 })}<span>A prévia fica em <a class="rf-link" href="dist/figma-plugin/preview.html" target="_blank" rel="noopener">dist/figma-plugin/preview.html</a> — uma aproximação (auto layout vira flexbox). O Figma de verdade é a palavra final.</span></p>`,
    )}

    ${section(
      'rf-limites',
      'Limitações',
      'O que o plugin não faz — de propósito ou por limite do Figma.',
      `<div class="usage-grid">
        ${LIMITS.map(([title, text]) => `<article class="usage-card usage-card--tip"><p class="usage-card__head">${icon('info', { size: 18 })}${title}</p><p class="usage-card__text">${text}</p></article>`).join('')}
      </div>`,
    )}

    ${section(
      'rf-manter',
      'Para quem mantém',
      'Um arquivo por grupo em <code class="ds-inline-code">figma/plugin/</code>, em ordem: o núcleo (00), os modelos (30, 40) e os blocos. Cada arquivo registra os seus com <code class="ds-inline-code">defineBlock</code>.',
      codeBlock(CODE_BLOCK),
    )}
  </div>`;
}

export function mount(root) {
  const unmountNav = mountDocNav(root);
  const unmountCopy = mountCodeCopy(root);
  let alive = true;

  fetch(SUMMARY_URL, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!alive || !data) return;
      const set = (k, v) => {
        const el = root.querySelector(`[data-stat="${k}"]`);
        if (el) el.textContent = v;
      };
      set('pages', data.pages.length);
      set('blocks', data.blocks.length);
      set('variants', data.blocks.reduce((a, b) => a + b.variants, 0));
      set('icons', data.icons);
      const byPage = {};
      data.blocks.forEach((b) => (byPage[b.page] ??= []).push(b));
      const list = root.querySelector('[data-blocks]');
      list.replaceChildren();
      for (const [pageName, blocks] of Object.entries(byPage)) {
        const group = document.createElement('div');
        group.className = 'rf-list__group';
        const h = document.createElement('p');
        h.className = 'rf-list__page';
        h.textContent = `Órbita · ${pageName}`;
        group.append(h);
        const ul = document.createElement('ul');
        ul.className = 'rf-list__items';
        ul.setAttribute('role', 'list');
        for (const b of blocks) {
          const li = document.createElement('li');
          li.className = 'rf-list__item';
          const name = document.createElement('span');
          name.textContent = b.title;
          const meta = document.createElement('span');
          meta.className = 'rf-list__meta';
          meta.textContent = b.variants ? `${b.variants} variantes` : b.sets ? `${b.sets} conjuntos` : 'documentação';
          li.append(name, meta);
          ul.append(li);
        }
        group.append(ul);
        list.append(group);
      }
    })
    .catch(() => {});

  return () => {
    alive = false;
    unmountNav();
    unmountCopy();
  };
}
