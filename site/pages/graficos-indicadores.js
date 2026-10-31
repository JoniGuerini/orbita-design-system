import { icon } from '../../ds/icons/icons.js';
import { statTile, sparkline, meter } from '../../ds/js/charts.js';
import { mountDocNav } from '../doc-nav.js';
import { playgroundMarkup, mountPlayground, mountCodeCopy, codeBlock, tokenTable, a11yList, escapeHtml } from '../component-doc.js';
import { revenue, activeUsers } from '../chart-data.js';

export const styles = ['site/component-doc.css', 'site/pages/graficos-indicadores.css'];

/* ───────── Dados ───────── */

const TRENDS = {
  up: [8, 9, 9, 11, 10, 12, 13, 12, 14, 15, 15, 17],
  down: [17, 16, 16, 14, 15, 13, 12, 13, 11, 10, 10, 9],
  flat: [12, 13, 12, 12, 13, 12, 11, 12, 13, 12, 12, 12],
};
const DELTAS = { up: 0.124, down: -0.083, flat: 0, none: null };

const CONTROLS = [
  { id: 'delta', label: 'Variação', value: 'up', options: [{ value: 'up', label: 'Alta' }, { value: 'down', label: 'Queda' }, { value: 'flat', label: 'Estável' }, { value: 'none', label: 'Sem variação' }] },
  { id: 'good', label: 'Bom quando', value: 'up', options: [{ value: 'up', label: 'Sobe' }, { value: 'down', label: 'Cai' }, { value: 'none', label: 'Neutro' }] },
  { id: 'trend', label: 'Tendência', value: 'on', options: [{ value: 'on', label: 'Com sparkline' }, { value: 'off', label: 'Sem sparkline' }] },
  { id: 'size', label: 'Tamanho', value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'hero', label: 'Destaque' }] },
];

const tileOptions = (s) => ({
  label: s.label || 'Receita',
  value: 1284000,
  format: 'currency-compact',
  delta: DELTAS[s.delta],
  deltaLabel: s.delta === 'none' ? undefined : 'vs. mês anterior',
  good: s.good,
  trend: s.trend === 'on' ? TRENDS[s.delta === 'none' ? 'up' : s.delta] : undefined,
  hero: s.size === 'hero',
});

function tileCode(s) {
  const o = tileOptions(s);
  const lines = [`  label: '${String(o.label).replace(/'/g, "\\'")}',`, '  value: 1284000,', "  format: 'currency-compact',"];
  if (o.delta != null) lines.push(`  delta: ${o.delta},`, "  deltaLabel: 'vs. mês anterior',");
  if (o.delta != null && o.good !== 'up') lines.push(`  good: '${o.good}',`);
  if (o.trend) lines.push(`  trend: [${o.trend.slice(0, 4).join(', ')}, …],`);
  if (o.hero) lines.push('  hero: true,');
  return `import { statTile } from './ds/js/charts.js';\n\nel.innerHTML = statTile({\n${lines.join('\n')}\n});`;
}

const KPIS = [
  { label: 'Receita', value: revenue[2026][11], format: 'currency-compact', delta: revenue[2026][11] / revenue[2026][10] - 1, deltaLabel: 'vs. novembro', trend: revenue[2026] },
  { label: 'Clientes ativos', value: activeUsers[2026][11], format: 'integer', delta: activeUsers[2026][11] / activeUsers[2026][10] - 1, deltaLabel: 'vs. novembro', trend: activeUsers[2026] },
  { label: 'Tempo de resposta', value: '182 ms', delta: 0.08, deltaLabel: 'vs. semana anterior', good: 'down', trend: [150, 160, 155, 170, 165, 175, 180, 170, 178, 185, 180, 182] },
  { label: 'Chamados abertos', value: 46, format: 'integer', delta: -0.21, deltaLabel: 'vs. semana anterior', good: 'down', trend: [70, 66, 68, 61, 63, 58, 57, 55, 52, 50, 49, 46] },
];

const SPARKS = [
  ['Com área', 'O padrão: linha no tom de contexto, lavagem leve e o ponto de agora na cor de destaque.', {}],
  ['Só a linha', 'Para linhas de tabela e lugares apertados, onde a área pesaria.', { area: false }],
  ['Sem ponto', 'Quando “agora” não importa — só o formato da curva.', { highlight: 'none', area: false }],
  ['Reta', 'Pontos ligados por segmentos, para séries curtas ou com degraus.', { curve: 'linear' }],
];

const PRODUCTS = [
  ['Conta', [42, 44, 43, 47, 49, 52, 51, 55, 58, 60, 63, 66], 66000, 0.048],
  ['Cartão', [80, 78, 81, 79, 76, 77, 74, 75, 73, 72, 70, 71], 71000, -0.014],
  ['Investimentos', [20, 22, 25, 24, 28, 31, 30, 34, 37, 36, 40, 44], 44000, 0.111],
  ['Seguros', [12.1, 12.2, 12, 12.3, 12.2, 12.1, 12.3, 12.2, 12.1, 12.2, 12, 12.1], 12000, 0],
];

const METERS = [
  { label: 'Armazenamento', value: 42, max: 100, format: (v) => `${v} GB`, caption: 'Limite do plano: 100 GB' },
  { label: 'Cota de API', value: 78, max: 100, format: 'integer', caption: 'Atenção a partir de 75% — renova em 3 dias' },
  { label: 'Limite usado', value: 4700, max: 5000, format: 'currency-compact', caption: 'Crítico a partir de 90%' },
];

const VARIATIONS = [
  ['Receita', 'R$ 1,3 mi', 0.124, 'up', 'Subiu e subir é bom: melhora.'],
  ['Custo de aquisição', 'R$ 84', 0.08, 'down', 'Subiu, mas o bom é cair: piora.'],
  ['Tempo de resposta', '182 ms', -0.14, 'down', 'Caiu e cair é bom: melhora.'],
  ['Clientes ativos', '38.210', -0.031, 'up', 'Caiu e o bom é subir: piora.'],
  ['Visitas', '12.400', 0, 'up', 'Não mudou: estável, sem cor.'],
  ['Temperatura do servidor', '41 °C', 0.02, 'none', 'Sem lado bom: só informa.'],
];

const NAV = [
  ['in-playground', 'Playground'],
  ['in-anatomia', 'Anatomia'],
  ['in-kpis', 'Linha de indicadores'],
  ['in-destaque', 'Número de destaque'],
  ['in-sparkline', 'Sparkline'],
  ['in-medidor', 'Medidor'],
  ['in-variacao', 'Variação'],
  ['in-acessibilidade', 'Acessibilidade'],
  ['in-tokens', 'Tokens'],
  ['in-uso', 'Uso'],
  ['in-api', 'API'],
];

const section = (id, title, desc, body) => `<section class="doc-section" id="${id}" aria-labelledby="${id}-title">
    <header class="doc-section__header"><div>
      <h2 class="doc-section__title" id="${id}-title">${title}</h2>
      <p class="doc-section__desc">${desc}</p>
    </div></header>
    ${body}
  </section>`;

const anatomyTile = () =>
  statTile({ label: 'Clientes ativos', value: 38210, format: 'integer', delta: 0.137, deltaLabel: 'vs. mês anterior', trend: activeUsers[2026] })
    .replace('class="ds-stat__label"', 'class="ds-stat__label" data-num="1"')
    .replace('class="ds-stat__value"', 'class="ds-stat__value" data-num="2"')
    .replace('class="ds-stat__change"', 'class="ds-stat__change" data-num="3"')
    .replace('class="ds-stat__period"', 'class="ds-stat__period" data-num="4"')
    .replace('class="ds-stat__trend"', 'class="ds-stat__trend" data-num="5"');

const fmtTable = (v) => (v === 0 ? '0%' : `${v > 0 ? '+' : '−'}${Math.abs(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);

const API = [
  ['statTile(options)', 'Indicador completo. Devolve HTML.', [
    ['label', 'Rótulo, em caixa de frase e sem dois-pontos.'],
    ['value · format', 'Número e formato (\'currency-compact\', \'integer\'…) — ou um texto pronto, como \'182 ms\'.'],
    ['delta · deltaFormat', 'Variação (razão: 0,124 = +12,4%) e como mostrá-la. Padrão: porcentagem.'],
    ['deltaLabel', 'Contra o quê: “vs. mês anterior”. Sem período, a variação não diz nada.'],
    ['good', '\'up\' (subir é bom), \'down\' (cair é bom) ou \'none\' (sem lado bom).'],
    ['trend · trendLabel', 'Série da sparkline e o nome acessível dela.'],
    ['hero · href', 'Versão de destaque; com href, o indicador vira link.'],
  ]],
  ['sparkline(values, options)', 'Linha de tendência sem eixos. Devolve HTML que estica na largura do contêiner.', [
    ['width · height', 'Tamanho padrão quando nada manda nele (112 × 32).'],
    ['area · curve', 'Lavagem sob a linha (padrão) e \'smooth\' ou \'linear\'.'],
    ['highlight', '\'last\' marca o ponto atual; \'none\' tira o ponto.'],
    ['color · label', 'Cor da linha (padrão: chart.other) e o nome acessível.'],
    ['domain', 'Escala fixa [mín, máx]. Sem ela, a escala cobre ao menos 10% do valor — série estável não vira serra.'],
  ]],
  ['meter(options)', 'Uma razão contra um limite. Devolve HTML com role="meter".', [
    ['label · value · max · min', 'O que mede e em que faixa.'],
    ['format', 'Formato do valor; sem ele, mostra a porcentagem.'],
    ['thresholds', 'Onde vira atenção e crítico. Padrão: { warning: 0.75, danger: 0.9 }.'],
    ['tone · size · caption', 'Força um tom (\'success\'…), versão \'sm\' e uma linha de apoio.'],
  ]],
];

/* ───────── Página ───────── */

export default function renderIndicadores(page) {
  return `
  <div class="page doc gi">
    <header class="doc-header">
      <div>
        <p class="doc-header__eyebrow">${page.group}</p>
        <h1 class="doc-header__title">Indicadores</h1>
        <p class="doc-header__lead">Quando o gráfico é um número. O valor de agora, quanto mudou e para onde vai — sem eixo, sem legenda, sem esforço para ler.</p>
      </div>
      <dl class="doc-stats">
        <div class="doc-stat"><dt class="doc-stat__label">peças</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">destaque por tela</dt><dd class="doc-stat__value">1</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">sentidos da variação</dt><dd class="doc-stat__value">3</dd></div>
        <div class="doc-stat"><dt class="doc-stat__label">tons do medidor</dt><dd class="doc-stat__value">4</dd></div>
      </dl>
    </header>

    <nav class="doc-nav" aria-label="Nesta página">
      ${NAV.map(([id, label]) => `<button type="button" class="doc-nav__link" data-target="${id}">${label}</button>`).join('')}
    </nav>

    ${section('in-playground', 'Playground', 'Monte o indicador, veja nos dois temas e copie o código. Troque “Bom quando” para ver a mesma alta virar piora.', playgroundMarkup('indicador'))}

    ${section(
      'in-anatomia',
      'Anatomia',
      'Cinco partes, sempre nesta ordem. Só o rótulo e o valor são obrigatórios.',
      `<div class="gi-anatomy">
        <div class="gi-anatomy__stage" aria-hidden="true"><div class="gi-anatomy__tile" inert>${anatomyTile()}</div></div>
        <ol class="gi-anatomy__legend" role="list">
          ${[
            ['Rótulo', 'O que é medido, em caixa de frase e sem dois-pontos.'],
            ['Valor', 'Sans semibold, compactado (38,2 mil; R$ 1,3 mi). Algarismos proporcionais.'],
            ['Variação', 'Sinal, ícone e texto juntos. A cor diz se melhorou ou piorou — nunca sozinha.', true],
            ['Período', 'Contra o quê a variação foi medida. Sem ele, o número não diz nada.', true],
            ['Tendência', 'Sparkline no tom de contexto; o ponto de agora na cor de destaque.', true],
          ]
            .map(([title, text, optional], i) => `<li><span class="gi-anatomy__num">${i + 1}</span><div><p class="gi-anatomy__title">${title}${optional ? ' <span class="gi-anatomy__optional">opcional</span>' : ''}</p><p class="gi-anatomy__text">${text}</p></div></li>`)
            .join('')}
        </ol>
      </div>`,
    )}

    ${section(
      'in-kpis',
      'Linha de indicadores',
      'Os números que abrem um painel. Mesma estrutura, mesmo período de comparação, do mais importante para o menos.',
      `<div class="gi-kpis">${KPIS.map((k) => statTile(k)).join('')}</div>
      <ul class="gi-rules" role="list">
        <li>${icon('check', { size: 16 })}De 2 a 5 por linha. Mais que isso vira tabela.</li>
        <li>${icon('check', { size: 16 })}Todos comparados com o mesmo período — ou cada um diz o seu.</li>
        <li>${icon('check', { size: 16 })}Clicável quando leva a um detalhe (<code class="ds-inline-code">href</code>).</li>
      </ul>`,
    )}

    ${section(
      'in-destaque',
      'Número de destaque',
      'O número que a tela inteira existe para mostrar. Um só por vista, na mesma sans do resto — fonte de display ou serifada parece enfeite.',
      `<div class="gi-hero">
        <div class="gi-hero__tile">${statTile({ label: 'Receita em 2026', value: revenue[2026].reduce((a, v) => a + v, 0), format: 'currency-compact', delta: revenue[2026].reduce((a, v) => a + v, 0) / revenue[2025].reduce((a, v) => a + v, 0) - 1, deltaLabel: 'vs. 2025', trend: revenue[2026], hero: true })}</div>
        <div class="gi-figures">
          <p class="gi-figures__title">Algarismos proporcionais no número grande</p>
          <div class="gi-figures__compare">
            <div><span class="gi-figures__num" data-figures="proportional">1.121</span><span class="gi-figures__label">${icon('check-circle', { size: 16 })}Proporcional</span></div>
            <div><span class="gi-figures__num" data-figures="tabular">1.121</span><span class="gi-figures__label">${icon('x-circle', { size: 16 })}Tabular</span></div>
          </div>
          <p class="gi-figures__text">Em tamanho grande, algarismos tabulares dão a cada dígito a largura de um zero e o “1” fica solto. Guarde <code class="ds-inline-code">tabular-nums</code> para colunas que precisam alinhar.</p>
        </div>
      </div>`,
    )}

    ${section(
      'in-sparkline',
      'Sparkline',
      'A tendência sem eixos, em linha com o texto. Estica na largura de quem a contém e o traço não deforma.',
      `<div class="gi-sparks">
        ${SPARKS.map(
          ([name, text, opts]) => `<article class="gi-spark">
            <div class="gi-spark__preview">${sparkline(activeUsers[2026], { height: 48, ...opts })}</div>
            <div class="gi-spark__body"><p class="gi-spark__name">${name}</p><p class="gi-spark__text">${text}</p></div>
          </article>`,
        ).join('')}
      </div>
      <h3 class="doc-subhead">Dentro de uma tabela</h3>
      <div class="ds-table-wrap gi-table" role="region" tabindex="0" aria-label="Receita por produto">
        <table class="ds-table">
          <thead><tr><th scope="col">Produto</th><th scope="col" class="ds-table__num">Receita no mês</th><th scope="col">Últimos 12 meses</th><th scope="col" class="ds-table__num">Variação</th></tr></thead>
          <tbody>
            ${PRODUCTS.map(([name, trend, value, delta]) => {
              const tone = delta === 0 ? 'neutral' : delta > 0 ? 'good' : 'bad';
              const ic = delta === 0 ? 'minus' : delta > 0 ? 'trending-up' : 'trending-down';
              return `<tr>
                <th scope="row">${name}</th>
                <td class="ds-table__num">${escapeHtml(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value))}</td>
                <td>${sparkline(trend, { width: 96, height: 24, area: false, label: `Receita de ${name} nos últimos 12 meses` })}</td>
                <td class="ds-table__num"><span class="ds-stat__delta gi-delta" data-tone="${tone}"><span class="ds-stat__change">${icon(ic, { size: 16 })}${fmtTable(delta)}</span></span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`,
    )}

    ${section(
      'in-medidor',
      'Medidor',
      'Uma razão contra um limite. O preenchimento carrega a gravidade — marca, atenção, crítico — e a trilha é um tom mais claro da mesma cor. A partir da atenção, ganha ícone.',
      `<div class="gi-meters">
        <div class="gi-meters__card">${METERS.map((m) => meter(m)).join('')}</div>
        <div class="gi-meters__card">
          ${meter({ label: 'Meta de vendas', value: 112, max: 100, format: 'integer', tone: 'success', caption: 'Meta batida — tom de sucesso forçado com tone' })}
          ${meter({ label: 'Onboarding', value: 3, max: 5, format: (v) => `${v} etapas`, size: 'sm' })}
          ${meter({ label: 'Espaço do time', value: 0.86, max: 1, thresholds: { warning: 0.6, danger: 0.85 }, size: 'sm', caption: 'Limites próprios: atenção em 60%, crítico em 85%' })}
        </div>
      </div>
      <p class="gi-note">Duas fatias de pizza são um medidor. Para várias partes de um todo, use a <a href="#/graficos/rosca">rosca</a> ou barras empilhadas.</p>`,
    )}

    ${section(
      'in-variacao',
      'Variação',
      'A cor sai de dois fatos: para onde o número foi e se isso é bom. A mesma alta pode ser melhora ou piora — por isso o sinal, o ícone e o texto vêm sempre juntos.',
      `<div class="gi-variations">
        ${VARIATIONS.map(
          ([label, value, delta, good, text]) => `<div class="gi-variation">
            ${statTile({ label, value, delta, good, deltaLabel: good === 'none' ? 'vs. ontem' : 'vs. mês anterior' })}
            <p class="gi-variation__text">${text}</p>
          </div>`,
        ).join('')}
      </div>`,
    )}

    ${section(
      'in-acessibilidade',
      'Acessibilidade',
      'O indicador é texto, então já começa acessível. Estes detalhes completam.',
      a11yList([
        ['Número é texto', 'Valor, variação e período são texto de verdade — leitores de tela leem, buscadores acham, dá para copiar.'],
        ['Melhora ou piora, por escrito', 'A variação leva um texto oculto — “(melhora)”, “(piora)” ou “(estável)” — porque a cor não chega ao leitor de tela.'],
        ['Cor nunca sozinha', 'Sinal (+ ou −) e ícone de alta ou queda acompanham a cor. Funciona em escala de cinza e para daltônicos.'],
        ['Sparkline com nome', 'Com <code class="ds-inline-code">trendLabel</code> ou <code class="ds-inline-code">label</code>, vira uma imagem com descrição; sem, fica oculta — o número já disse tudo.'],
        ['Medidor semântico', '<code class="ds-inline-code">role="meter"</code> com valor, mínimo, máximo e um texto que inclui o estado: “92 de 100, crítico”.'],
        ['Contraste da variação', 'Verde e vermelho de texto (<code class="ds-inline-code">success.fg</code>, <code class="ds-inline-code">danger.fg</code>) passam de 4,5:1 nos dois temas.'],
      ]),
    )}

    ${section(
      'in-tokens',
      'Tokens',
      'O que indicador, sparkline e medidor consomem.',
      tokenTable([
        ['color.bg.surface', 'Fundo do indicador'],
        ['color.border.subtle', 'Contorno'],
        ['radius.xl', 'Raio do indicador'],
        ['color.fg.muted', 'Rótulo'],
        ['color.fg.default', 'Valor'],
        ['color.fg.subtle', 'Período'],
        ['color.success.fg', 'Variação que melhora'],
        ['color.danger.fg', 'Variação que piora'],
        ['color.chart.other', 'Linha da sparkline'],
        ['color.chart.series.1', 'Ponto atual da sparkline'],
        ['color.brand.solid', 'Medidor normal'],
        ['color.brand.subtle', 'Trilha do medidor normal'],
        ['color.chart.status.warning', 'Medidor em atenção'],
        ['color.chart.status.critical', 'Medidor crítico'],
        ['color.chart.status.good', 'Medidor com meta batida'],
        ['radius.full', 'Trilha do medidor'],
      ]),
    )}

    ${section(
      'in-uso',
      'Uso',
      'Quando um número basta — e como não estragá-lo.',
      `<div class="usage-grid gi-usage">
        <article class="usage-card usage-card--do">
          <p class="usage-card__head">${icon('check-circle', { size: 20 })}Faça: um número no lugar de uma barra</p>
          <div class="gi-usage__preview"><span class="gi-usage__big">38,2 mil</span></div>
          <p class="usage-card__text">Um valor só não precisa de gráfico. Uma coluna sozinha ou uma pizza de duas fatias viram indicador.</p>
        </article>
        <article class="usage-card usage-card--dont">
          <p class="usage-card__head">${icon('x-circle', { size: 20 })}Evite: variação sem período</p>
          <div class="gi-usage__preview"><span class="ds-stat__delta" data-tone="good"><span class="ds-stat__change">${icon('trending-up', { size: 16 })}+12,4%</span></span><span class="gi-usage__vs">em relação a quê?</span></div>
          <p class="usage-card__text">“+12%” sozinho não diz se é sobre ontem ou sobre o ano passado. Nomeie o período.</p>
        </article>
        <article class="usage-card usage-card--tip">
          <p class="usage-card__head">${icon('zap', { size: 20 })}Um destaque por tela</p>
          <div class="gi-usage__preview"><span class="gi-usage__big gi-usage__big--lg">R$ 1,4 mi</span></div>
          <p class="usage-card__text">Se dois números disputam o topo, nenhum ganha. Escolha o que a tela existe para mostrar.</p>
        </article>
      </div>`,
    )}

    ${section(
      'in-api',
      'API',
      'Três funções que devolvem HTML, sem estado — use em qualquer lugar, inclusive dentro de tabelas e cards.',
      `${codeBlock(`import { statTile, sparkline, meter } from './ds/js/charts.js';

kpis.innerHTML = [
  statTile({ label: 'Receita', value: 1284000, format: 'currency-compact',
             delta: 0.124, deltaLabel: 'vs. mês anterior', trend: receita }),
  statTile({ label: 'Tempo de resposta', value: '182 ms',
             delta: 0.08, deltaLabel: 'vs. semana anterior', good: 'down' }),
].join('');

celula.innerHTML = sparkline(receita, { width: 96, height: 24, area: false });
uso.innerHTML = meter({ label: 'Armazenamento', value: 72, max: 100, format: (v) => \`\${v} GB\` });`)}
      <div class="gi-api">
        ${API.map(
          ([fn, text, rows]) => `<div class="gi-api__fn">
            <p class="gi-api__name"><code>${escapeHtml(fn)}</code></p>
            <p class="gi-api__text">${escapeHtml(text)}</p>
            <div class="doc-table gi-api__table">
              ${rows.map(([name, desc]) => `<div class="doc-table__row"><code class="ds-inline-code">${escapeHtml(name)}</code><span>${escapeHtml(desc)}</span></div>`).join('')}
            </div>
          </div>`,
        ).join('')}
      </div>`,
    )}
  </div>`;
}

export function mount(root) {
  const unPlayground = mountPlayground(root, {
    id: 'indicador',
    controls: CONTROLS,
    text: { id: 'label', label: 'Rótulo', value: 'Receita' },
    render: (s) => `<div class="gi-preview${s.size === 'hero' ? ' gi-preview--hero' : ''}">${statTile(tileOptions(s))}</div>`,
    code: tileCode,
  });
  const unCopy = mountCodeCopy(root);
  const unNav = mountDocNav(root);
  return () => {
    unPlayground();
    unCopy();
    unNav();
  };
}
