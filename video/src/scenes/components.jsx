import { motion, useTransform } from 'motion/react';
import { EASE, Rise, useAfter, useEnter, useInOut, useKeys, useStep, useT, useTime } from '../time.jsx';
import { CHEV, Card, Head, Icon, Press, Typing } from '../ui.jsx';

/* ═════════ 04 · Componentes (painel, botões, busca, ajustes + troca de tema) ═════════ */

function Switch({ t, label, on: initial = false }) {
  const x = useT(t, t + 0.3, initial ? 16 : 0, initial ? 0 : 16);
  const on = useT(t, t + 0.25, initial ? 1 : 0, initial ? 0 : 1, EASE.standard);
  return (
    <span className="v-switch">
      <span className="v-switch__track">
        <motion.span className="v-switch__on" style={{ opacity: on }} />
        <motion.span className="v-switch__thumb" style={{ x }} />
      </span>
      {label && <span className="v-switch__label">{label}</span>}
    </span>
  );
}

const SEG = [
  ['monitor', 'Sistema'],
  ['moon', 'Escuro'],
  ['sun', 'Claro'],
];
const SEG_SWITCH = 5.4; // quando o segmentado vai para “Claro”

function Segmented() {
  const x = useT(SEG_SWITCH, SEG_SWITCH + 0.45, 96, 192);
  const selected = useAfter(SEG_SWITCH + 0.15) ? 2 : 1;
  return (
    <div className="v-seg">
      <motion.span className="v-seg__thumb" style={{ x }} />
      {SEG.map(([ic, label], i) => (
        <span key={label} className={`v-seg__item${i === selected ? ' is-on' : ''}`}>
          <Icon name={ic} size={16} />
          {label}
        </span>
      ))}
    </div>
  );
}

function Toast({ t, out = 99, tone = 'success', icon = 'check', children }) {
  const style = useInOut(t, out, { dur: 0.6, y: 14 });
  return (
    <motion.div className="v-toast" style={style}>
      <div className={`ds-toast ds-toast--${tone}`} data-open="">
        <span className="ds-toast__icon"><Icon name={icon} size={18} /></span>
        <span className="ds-toast__message">{children}</span>
      </div>
    </motion.div>
  );
}

function Board() {
  return (
    <>
      <Head t={0.2} stamp="04" label="Componentes" title="Planos, calmos e precisos">
        Contornos finos, nada de brilho. 16 componentes com anatomia, estados e acessibilidade.
      </Head>
      <div className="board">
        <Card t={0.5} className="board__panel">
          <div className="v-panel__head">
            <div>
              <p className="ds-panel__eyebrow">Roteiro</p>
              <p className="v-panel__title">Lançamento da versão 0.7</p>
            </div>
            <div className="v-panel__icons">
              <span className="ds-icon-btn"><Icon name="stack" /></span>
              <span className="ds-icon-btn"><Icon name="x" /></span>
            </div>
          </div>
          <div className="v-panel__chips">
            <span className="ds-chip ds-chip--sm">
              <span className="ds-chip__icon"><Icon name="pencil" size={14} /></span>Tom direto{CHEV}
            </span>
            <span className="ds-chip ds-chip--sm">Escuro{CHEV}</span>
            <span className="v-panel__meta">~3 min</span>
          </div>
          <p className="ds-section__head"><span className="ds-section__stamp">00</span><span>Sobre</span></p>
          <p className="v-panel__text">Cores, tipografia e ícones já estão em tokens, nos dois temas.</p>
          <span className="ds-inline-action">
            <Icon name="file-text" size={16} />Na cena<Icon name="plus" size={14} className="ds-inline-action__plus" />
          </span>
        </Card>

        <Card t={0.65} className="board__buttons">
          <p className="ds-panel__eyebrow">Botão</p>
          <div className="row">
            <Press t={3.8}>
              <span className="ds-btn ds-btn--primary"><Icon name="pencil" size={18} />Criar</span>
            </Press>
            <span className="ds-btn ds-btn--secondary">Cancelar</span>
            <span className="ds-icon-btn ds-icon-btn--outline"><Icon name="more-horizontal" /></span>
          </div>
        </Card>

        <Card t={0.8} className="board__search">
          <p className="ds-panel__eyebrow">Busca</p>
          <div className="ds-field v-field">
            <Icon name="search" size={18} />
            <Typing t0={1.8} t1={2.6} text="Seleção" placeholder="Buscar" />
            <kbd className="ds-kbd">⌘K</kbd>
          </div>
          <div className="row">
            <span className="ds-badge ds-badge--success"><span className="ds-badge__dot" />Pronto</span>
            <span className="ds-badge ds-badge--brand">Novo</span>
            <span className="ds-badge">Beta</span>
          </div>
        </Card>

        <Card t={0.95} className="board__settings">
          <p className="ds-panel__eyebrow">Ajustes</p>
          <Switch t={3.1} label="Notificações" />
          <Segmented />
        </Card>
      </div>
      <Toast t={4.2} out={8.8}>Projeto criado</Toast>
    </>
  );
}

export function Components() {
  const time = useTime();
  // o tema claro abre em círculo a partir do segmentado
  const radius = useT(SEG_SWITCH + 0.25, SEG_SWITCH + 1.35, 0, 1600, EASE.emphasized);
  const clipPath = useTransform(radius, (r) => `circle(${r}px at 1106px 559px)`);
  const lightVisible = useTransform(time, (t) => (t > SEG_SWITCH + 0.25 ? 'visible' : 'hidden'));
  return (
    <>
      <div className="layer">
        <Board />
      </div>
      <motion.div className="layer layer--light" data-theme="light" style={{ clipPath, visibility: lightVisible }}>
        <Board />
      </motion.div>
    </>
  );
}

/* ═════════ 05 · Formulários e seleção ═════════ */

/** Digitação com pausas: keys = [[t, nº de letras], …]. */
function TypeKeys({ keys, text, caretFrom, caretTo }) {
  const time = useTime();
  const n = useKeys(keys.map((k) => k[0]), keys.map((k) => k[1]), EASE.linear);
  const shown = useTransform(n, (v) => text.slice(0, Math.round(v)));
  const blink = useTransform(time, (t) => (t > caretFrom && t < caretTo && Math.floor(t * 2.4) % 2 === 0 ? 1 : 0));
  return (
    <span className="typing">
      <motion.span>{shown}</motion.span>
      <motion.span className="typing__caret" style={{ opacity: blink }} />
    </span>
  );
}

function Fade({ t, out = 99, children, className = '', y = 6 }) {
  const style = useInOut(t, out, { dur: 0.4, y, outDur: 0.2 });
  return (
    <motion.div className={className} style={style}>
      {children}
    </motion.div>
  );
}

function Checkbox({ label, checked }) {
  return (
    <label className="ds-checkbox">
      <input type="checkbox" className="ds-checkbox__input" checked={checked} readOnly tabIndex={-1} />
      <span className="ds-choice__text"><span className="ds-choice__label">{label}</span></span>
    </label>
  );
}

function Radio({ label, checked }) {
  return (
    <label className="ds-radio">
      <input type="radio" className="ds-radio__input" checked={checked} readOnly tabIndex={-1} />
      <span className="ds-choice__text"><span className="ds-choice__label">{label}</span></span>
    </label>
  );
}

const LANGS = ['Português (Brasil)', 'English (US)', 'Español', 'Français', 'Deutsch'];

function SelectDemo() {
  const open = useInOut(1.6, 3.45, { dur: 0.35, y: -6, outDur: 0.18 });
  const active = useStep([2.35]); // 0 → 1
  const chosen = useAfter(3.2) ? 1 : 0;
  const expanded = useStep([1.6, 3.5]) === 1;
  return (
    <div className="ds-form-field v-select">
      <span className="ds-form-field__label">Idioma</span>
      <div className="ds-select">
        <span className="ds-select__trigger" aria-expanded={expanded}>
          <Icon name="globe" size={18} className="ds-select__icon" />
          <span className="ds-select__value">{LANGS[chosen]}</span>
          <Icon name="chevron-down" size={16} className="ds-select__chevron" />
        </span>
      </div>
      <motion.div className="ds-select-popup v-popup" data-open="" style={open}>
        <div className="ds-select-popup__list">
          {LANGS.map((l, i) => (
            <div key={l} className="ds-select-popup__option" aria-selected={i === chosen} data-active={i === active ? '' : undefined}>
              <span className="ds-select-popup__label">{l}</span>
              <Icon name="check" size={16} className="ds-select-popup__check" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function Forms() {
  const nameFocus = useStep([0.9, 2.1]) === 1;
  const mailFocus = useStep([2.1, 4.7]) === 1;
  const invalid = useStep([3.15, 4.35]) === 1;
  const mailOk = useAfter(4.35);
  const email = useAfter(5.0);
  const sms = useAfter(5.5);
  const freq = useAfter(6.1) ? 0 : 1;
  return (
    <>
      <Head t={0.2} stamp="05" label="Formulários e seleção" title="Cada campo diz o que espera" compact />
      <div className="forms">
        <Card t={0.45} className="forms__main">
          <p className="ds-section__head"><span className="ds-section__stamp">01</span><span>Sobre o projeto</span></p>
          <div className="ds-form-field">
            <span className="ds-form-field__label">Nome do projeto</span>
            <div className="ds-field" data-state={nameFocus ? 'focus' : undefined}>
              <span className="ds-field__input v-input">
                <Typing t0={1.0} t1={1.6} text="Órbita" placeholder="Ex.: Lançamento" caret={nameFocus} />
              </span>
            </div>
            <div className="ds-form-field__footer">
              <p className="ds-form-field__hint">Aparece no menu e na busca.</p>
            </div>
          </div>
          <div className="ds-form-field">
            <span className="ds-form-field__label">E-mail para avisos</span>
            <div className="ds-field" data-state={mailFocus ? 'focus' : undefined}>
              <Icon name="mail" size={18} />
              <span className="ds-field__input v-input" aria-invalid={invalid ? 'true' : undefined}>
                <TypeKeys text="jon@orbita.com" keys={[[2.2, 0], [2.9, 10], [3.9, 10], [4.3, 14]]} caretFrom={2.1} caretTo={4.7} />
              </span>
              {mailOk && <Icon name="check" size={18} className="v-ok" />}
            </div>
            <div className="ds-form-field__footer v-swap">
              <Fade t={0} out={3.15} className="ds-form-field__hint">Vamos avisar só o essencial.</Fade>
              <Fade t={3.15} out={4.35} className="ds-form-field__error">
                <Icon name="alert-circle" size={16} />
                Use um e-mail no formato nome@empresa.com
              </Fade>
              <Fade t={4.45} className="ds-form-field__hint">Tudo certo.</Fade>
            </div>
          </div>
          <fieldset className="ds-choice-group">
            <legend className="ds-choice-group__legend">Avisar por</legend>
            <div className="ds-choice-group__items ds-choice-group--inline v-inline">
              <Checkbox label="E-mail" checked={email} />
              <Checkbox label="Notificação no celular" checked />
              <Checkbox label="SMS" checked={sms} />
            </div>
          </fieldset>
        </Card>

        <Card t={0.6} className="forms__side">
          <SelectDemo />
          <fieldset className="ds-choice-group v-radios">
            <legend className="ds-choice-group__legend">Resumo por e-mail</legend>
            <div className="ds-choice-group__items">
              {['Diário', 'Semanal', 'Mensal'].map((l, i) => (
                <Radio key={l} label={l} checked={i === freq} />
              ))}
            </div>
          </fieldset>
          <div className="forms__actions">
            <span className="ds-btn ds-btn--secondary">Cancelar</span>
            <Press t={6.9}>
              <span className="ds-btn ds-btn--primary">Criar projeto</span>
            </Press>
          </div>
        </Card>
      </div>
      <Toast t={7.1}>Projeto criado</Toast>
    </>
  );
}

/* ═════════ 06 · Navegação e camadas ═════════ */

const TABS = [
  ['Visão geral'],
  ['Atividade', 12],
  ['Arquivos', 3],
  ['Ajustes'],
];

const PEOPLE = [
  ['MD', 'sand', 'Marina Duarte'],
  ['CR', 'green', 'Caio Ramos'],
  ['LN', 'slate', 'Lia Nakamura'],
  ['OP', 'violet', 'Otávio Prado'],
];

function TabPanel({ tab, t }) {
  if (tab === 0)
    return (
      <Rise t={t} y={10} className="v-tabpanel" key="0">
        <p className="v-tabpanel__title">Lançamento da 1.0</p>
        <p className="v-tabpanel__text">Resumo do projeto, responsáveis e próximos passos.</p>
        <div className="ds-meter v-meter">
          <div className="ds-meter__head"><span className="ds-meter__label">Progresso</span><span className="ds-meter__value">68%</span></div>
          <div className="ds-meter__track"><span className="ds-meter__fill" style={{ width: '68%' }} /></div>
        </div>
      </Rise>
    );
  if (tab === 1)
    return (
      <div className="v-tabpanel" key="1">
        {[
          ['MD', 'sand', 'Marina publicou a versão 0.7', 'há 2 h'],
          ['CR', 'green', 'Caio revisou o Chip', 'há 5 h'],
          ['LN', 'slate', 'Lia comentou em Tabela', 'ontem'],
        ].map(([ini, tone, text, when], i) => (
          <Rise key={text} t={t + i * 0.08} y={10} className="v-activity">
            <span className={`ds-avatar ds-avatar--sm ds-avatar--${tone}`}><span>{ini}</span></span>
            <span className="v-activity__text">{text}</span>
            <span className="v-activity__when">{when}</span>
          </Rise>
        ))}
      </div>
    );
  return (
    <div className="v-tabpanel v-files" key="2">
      {[
        ['file-text', 'briefing.pdf', '242 KB'],
        ['file-text', 'roteiro.md', '8 KB'],
        ['download', 'tokens.json', '31 KB'],
      ].map(([ic, name, size], i) => (
        <Rise key={name} t={t + i * 0.08} y={10} as="span" className="ds-attachment">
          <span className="ds-attachment__icon"><Icon name={ic} size={18} /></span>
          <span className="ds-attachment__name">{name}</span>
          <span className="ds-attachment__size">{size}</span>
        </Rise>
      ))}
    </div>
  );
}

const SORTS = ['Mais recentes', 'Nome', 'Tamanho', 'Tipo de arquivo'];

export function Overlays() {
  const tab = useStep([1.5, 2.8]);
  const tipStyle = useInOut(3.3, 4.3, { dur: 0.35, y: 4, outDur: 0.2 });
  const menuStyle = useInOut(4.5, 5.75, { dur: 0.35, y: -6, outDur: 0.18 });
  const hover = useStep([4.95, 5.2]); // 0: nenhum · 1: Nome em destaque · 2: escolhido
  const sort = useAfter(5.5) ? 1 : 0;
  const menuOpen = useStep([4.5, 5.75]) === 1;
  const overlay = useKeys([6.0, 6.3, 7.5, 7.75], [0, 1, 1, 0]);
  const modal = useInOut(6.05, 7.5, { dur: 0.5, y: 16, scale: 0.97, outDur: 0.22 });
  return (
    <>
      <Head t={0.2} stamp="06" label="Navegação e camadas" title="Abas, menus, tooltips e modais" compact />
      <div className="overlays">
        <Card t={0.45} className="overlays__tabs">
          <div className="ds-tabs v-tabs">
            <div className="ds-tabs__list">
              {TABS.map(([label, count], i) => (
                <span key={label} className="ds-tabs__tab" aria-selected={i === tab}>
                  <span>{label}</span>
                  {count && <span className="ds-tabs__count">{count}</span>}
                </span>
              ))}
            </div>
          </div>
          <TabPanel tab={tab} t={[0.8, 1.5, 2.8][tab]} />
        </Card>

        <Card t={0.6} className="overlays__side">
          <p className="ds-panel__eyebrow">Arquivos</p>
          <div className="v-menu-anchor">
            <span className="ds-chip" aria-expanded={menuOpen}>
              <span className="ds-chip__icon"><Icon name="sliders" size={16} /></span>
              Ordenar: {SORTS[sort]}
              {CHEV}
            </span>
            <motion.div className="ds-menu v-menu" data-open="" style={menuStyle}>
              <p className="ds-menu__label">Ordenar por</p>
              {SORTS.map((s, i) => (
                <span key={s} className={`ds-menu__item${hover === 1 && i === 1 ? ' is-hover' : ''}`} aria-checked={i === sort}>
                  <Icon name={['clock', 'type', 'layers', 'file-text'][i]} size={18} />
                  <span className="ds-menu__text">{s}</span>
                  <Icon name="check" size={16} className="ds-menu__check" />
                </span>
              ))}
            </motion.div>
          </div>
          <p className="ds-panel__eyebrow v-gap">Pessoas</p>
          <div className="v-avatars">
            <div className="ds-avatar-group">
              {PEOPLE.map(([ini, tone, name]) => (
                <span key={ini} className={`ds-avatar ds-avatar--sm ds-avatar--${tone}`} title={name}><span>{ini}</span></span>
              ))}
              <span className="ds-avatar ds-avatar--sm ds-avatar--more">+3</span>
            </div>
            <motion.div className="ds-tooltip v-tooltip" data-open="" style={tipStyle}>
              Marina Duarte
            </motion.div>
          </div>
        </Card>
      </div>

      <motion.div className="v-overlay" style={{ opacity: overlay }} />
      <motion.div className="v-modal" style={modal}>
        <div className="ds-modal ds-modal--inline">
          <header className="ds-modal__header">
            <div className="ds-modal__heading">
              <p className="ds-modal__eyebrow">Projeto</p>
              <h2 className="ds-modal__title">Publicar alterações?</h2>
            </div>
            <span className="ds-icon-btn ds-icon-btn--muted ds-modal__close"><Icon name="x" /></span>
          </header>
          <div className="ds-modal__body">As mudanças ficam visíveis para toda a equipe assim que você publicar.</div>
          <footer className="ds-modal__footer">
            <span className="ds-btn ds-btn--secondary">Cancelar</span>
            <Press t={7.25}>
              <span className="ds-btn ds-btn--primary">Publicar</span>
            </Press>
          </footer>
        </div>
      </motion.div>
      <Toast t={7.7}>Alterações publicadas</Toast>
    </>
  );
}

/* ═════════ 07 · Tabela e filtros ═════════ */

const ORDERS = [
  ['#1048', 'Ana Ribeiro', 'pago', 'App', 'R$ 312,90'],
  ['#1047', 'Davi Lima', 'pendente', 'Site', 'R$ 89,00'],
  ['#1046', 'Caio Mendes', 'pago', 'Loja', 'R$ 1.240,00'],
  ['#1045', 'Bia Santos', 'cancelado', 'App', 'R$ 54,50'],
  ['#1044', 'Lia Nakamura', 'pago', 'Parceiros', 'R$ 640,00'],
  ['#1043', 'Otávio Prado', 'pendente', 'Loja', 'R$ 129,90'],
  ['#1042', 'Marina Duarte', 'pago', 'Site', 'R$ 418,30'],
  ['#1041', 'Teresa Lins', 'pago', 'App', 'R$ 76,20'],
];
const STATUS = {
  pago: ['success', 'Pago'],
  pendente: ['warning', 'Pendente'],
  cancelado: ['danger', 'Cancelado'],
};
const FILTER_AT = 1.9;

function OrderRow({ row, t, selected }) {
  const [id, client, status, channel, total] = row;
  const enter = useEnter(t, { dur: 0.6, y: 8 });
  const [tone, label] = STATUS[status];
  return (
    <motion.tr style={enter} data-selected={selected ? '' : undefined}>
      <td className="ds-table__check"><input type="checkbox" checked={selected} readOnly tabIndex={-1} /></td>
      <td className="ds-table__strong">{id}</td>
      <td>{client}</td>
      <td><span className={`ds-badge ds-badge--sm ds-badge--${tone}`}>{label}</span></td>
      <td className="ds-table__muted">{channel}</td>
      <td className="ds-table__num">{total}</td>
    </motion.tr>
  );
}

export function Table() {
  const filtered = useAfter(FILTER_AT);
  const discount = useAfter(1.2);
  const sel = useStep([3.4, 3.75]);
  const rows = filtered ? ORDERS.filter((r) => r[2] === 'pago') : ORDERS.slice(0, 6);
  return (
    <>
      <Head t={0.2} stamp="07" label="Tabela e filtros" title="Filtrar, selecionar, agir" compact />
      <Card t={0.45} className="table-card">
        <div className="ds-filters">
          <div className="ds-filters__bar">
            <span className="ds-field ds-filters__search">
              <Icon name="search" size={18} />
              <span className="ds-field__placeholder">Buscar por cliente ou número</span>
            </span>
            <div className="ds-filters__controls">
              <span className="ds-chip ds-filters__field" data-active={filtered ? '' : undefined}>
                <span>{filtered ? 'Status: Pago' : 'Status'}</span>
                {CHEV}
              </span>
              <span className="ds-chip ds-filters__field">
                <span>Canal</span>
                {CHEV}
              </span>
              <span className="ds-chip" aria-pressed={discount}>
                {discount && <span className="ds-chip__check"><Icon name="check" size={16} /></span>}
                Com desconto
              </span>
            </div>
            <span className="ds-chip ds-filters__sort">
              <span className="ds-chip__icon"><Icon name="sliders" size={16} /></span>
              <span>Ordenar: Mais recentes</span>
              {CHEV}
            </span>
          </div>
          <div className="ds-filters__summary v-summary">
            {sel < 2 ? (
              <p className="ds-filters__count">{filtered ? '5 de 24 pedidos' : '24 pedidos'}</p>
            ) : (
              <Rise t={3.75} y={6} className="v-bulk">
                <span className="v-bulk__count">2 selecionados</span>
                <Press t={5.0}>
                  <span className="ds-btn ds-btn--secondary ds-btn--sm"><Icon name="download" size={16} />Exportar</span>
                </Press>
                <span className="ds-btn ds-btn--ghost ds-btn--sm">Marcar como enviado</span>
              </Rise>
            )}
            {filtered && (
              <Rise t={FILTER_AT} y={6} as="span" className="ds-chip ds-chip--sm ds-chip--removable">
                Pago
                <span className="ds-chip__remove"><Icon name="x" size={14} /></span>
              </Rise>
            )}
            {filtered && <span className="ds-inline-action ds-filters__clear">Limpar tudo</span>}
          </div>
        </div>
        <div className="ds-table-wrap v-table">
          <table className="ds-table">
            <thead>
              <tr>
                <th className="ds-table__check"><input type="checkbox" readOnly tabIndex={-1} checked={false} /></th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Canal</th>
                <th className="ds-table__num">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <OrderRow key={(filtered ? 'f' : 'a') + row[0]} row={row} t={(filtered ? FILTER_AT + 0.05 : 0.8) + i * 0.06} selected={filtered && i < sel} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Toast t={5.3} icon="download">2 pedidos exportados</Toast>
    </>
  );
}

/* ═════════ 08 · Conversa e busca ⌘K ═════════ */

const RESULTS = [
  ['dashboard', 'Visão geral', 'Gráficos'],
  ['bar-chart', 'Barras', 'Gráficos'],
  ['line-chart', 'Linhas e áreas', 'Gráficos'],
  ['donut', 'Rosca', 'Gráficos'],
];

function Command() {
  const style = useInOut(5.7, 99, { dur: 0.45, y: -10, scale: 0.98 });
  const active = useStep([7.3, 7.75]);
  const results = useAfter(6.55);
  return (
    <motion.div className="v-command" style={style}>
      <div className="ds-command" open>
        <div className="ds-command__search">
          <Icon name="search" size={20} />
          <span className="ds-command__input v-command__input">
            <Typing t0={6.05} t1={6.5} text="gráf" placeholder="Buscar páginas e ações…" />
          </span>
          <kbd className="ds-kbd">Esc</kbd>
        </div>
        <div className="ds-command__list">
          {results && (
            <div className="ds-command__group">
              <div className="ds-command__group-label">Gráficos</div>
              {RESULTS.map(([ic, label, hint], i) => (
                <Rise key={label} t={6.55 + i * 0.06} y={6} className="ds-command__item" aria-selected={i === active}>
                  <Icon name={ic} size={18} />
                  <span className="ds-command__label">{label}</span>
                  <span className="ds-command__hint">{hint}</span>
                  <Icon name="corner-down-left" size={16} className="ds-command__enter" />
                </Rise>
              ))}
            </div>
          )}
        </div>
        <footer className="ds-command__footer">
          <span><kbd className="ds-kbd">↑</kbd><kbd className="ds-kbd">↓</kbd> navegar</span>
          <span><kbd className="ds-kbd">↵</kbd> abrir</span>
          <span><kbd className="ds-kbd">Esc</kbd> fechar</span>
        </footer>
      </div>
    </motion.div>
  );
}

export function Chat() {
  const typing = useInOut(1.4, 2.35, { dur: 0.3, y: 4, outDur: 0.15 });
  const ready = useStep([3.85, 5.15]) === 1;
  const overlay = useT(5.6, 5.95, 0, 1, EASE.standard);
  const composerText = useStep([5.15]) === 0;
  const focus = useStep([3.7, 5.15]) === 1;
  const sent = useAfter(5.2);
  return (
    <>
      <div className="chat__left">
        <Head t={0.2} stamp="08" label="Conversa e busca" title="Para produtos que conversam">
          Mensagens, cartão de resultado, composer com comandos e a busca ⌘K em qualquer tela.
        </Head>
      </div>
      <Card t={0.35} className="chat__card">
        <div className="v-thread"><div className="ds-thread">
          <Rise t={0.5} as="p" y={6} className="ds-thread__divider">Hoje</Rise>
          <Rise t={0.6} y={14} as="article" className="ds-message ds-message--user">
            <div className="ds-message__attachments">
              <span className="ds-attachment">
                <span className="ds-attachment__icon"><Icon name="file-text" size={18} /></span>
                <span className="ds-attachment__name">briefing.pdf</span>
                <span className="ds-attachment__size">242 KB</span>
              </span>
            </div>
            <div className="ds-message__body"><p>Monte um roteiro para o lançamento da 1.0</p></div>
          </Rise>
          <Rise t={1.3} y={10} as="article" className="ds-message">
            <header className="ds-message__head"><span className="ds-message__mark">Ó</span><span className="ds-message__author">Órbita</span><span>14:32</span></header>
            <div className="v-reply">
              <motion.div className="ds-typing v-typing" style={typing}>
                <span className="ds-typing__dots"><i /><i /><i /></span>
                Escrevendo…
              </motion.div>
              <Rise t={2.35} y={6} className="ds-message__body"><p>Li o briefing. Montei um roteiro curto, em três cenas.</p></Rise>
            </div>
            <Rise t={2.6} y={12} as="section" className="ds-result-card">
              <header className="ds-result-card__head">
                <div>
                  <p className="ds-result-card__eyebrow">Roteiro · 3 cenas · ~45 s</p>
                  <p className="ds-result-card__title">Lançamento do Órbita 1.0</p>
                </div>
                <div className="ds-result-card__tools">
                  <span className="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted"><Icon name="copy" size={16} /></span>
                  <span className="ds-icon-btn ds-icon-btn--sm ds-icon-btn--muted"><Icon name="more-horizontal" size={16} /></span>
                </div>
              </header>
              <ol className="ds-result-card__list" role="list">
                {[
                  ['01', 'Abertura', 'Tela escura. O nome Órbita aparece, sem enfeite.'],
                  ['02', 'O sistema', 'Tokens, ícones e componentes, um de cada vez.'],
                  ['03', 'A virada', 'O tema claro abre a partir de um clique.'],
                ].map(([n, title, text], i) => (
                  <Rise key={n} t={2.8 + i * 0.12} y={8} as="li">
                    <p className="ds-section__head"><span className="ds-section__stamp">{n}</span><span>{title}</span></p>
                    <p className="ds-section__text">{text}</p>
                  </Rise>
                ))}
              </ol>
            </Rise>
          </Rise>
          {sent && (
            <Rise t={5.2} y={14} as="article" className="ds-message ds-message--user">
              <div className="ds-message__body"><p>Deixe a abertura mais curta</p></div>
            </Rise>
          )}
        </div></div>
        <Rise t={0.7} y={10} className="ds-composer v-composer" data-state={focus ? 'focus' : undefined}>
          <span className="ds-composer__input v-composer__input">
            {composerText ? <Typing t0={3.85} t1={5.0} text="Deixe a abertura mais curta" placeholder="Pergunte algo ou digite / para comandos" /> : <span className="ds-field__placeholder">Pergunte algo ou digite / para comandos</span>}
          </span>
          <div className="ds-composer__bar">
            <span className="ds-icon-btn ds-icon-btn--muted"><Icon name="paperclip" /></span>
            <span className="ds-icon-btn ds-icon-btn--muted"><Icon name="slash" /></span>
            <span className="ds-composer__spacer" />
            <Press t={5.1}>
              <span className="ds-composer__send" aria-disabled={ready ? undefined : 'true'}><Icon name="arrow-up" size={18} /></span>
            </Press>
          </div>
        </Rise>
      </Card>
      <motion.div className="v-overlay" style={{ opacity: overlay }} />
      <Command />
    </>
  );
}
