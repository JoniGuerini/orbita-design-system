/**
 * Imitação da API de plugins do Figma — só o que o plugin do Órbita usa, com as mesmas regras
 * que o Figma impõe (e os mesmos erros quando elas são quebradas):
 *   - texto só muda depois de loadFontAsync da fonte dele
 *   - FILL só em filho de auto layout; HUG só em auto layout ou texto; WRAP só na horizontal
 *   - conjunto de variantes só aceita componentes; nomes "Prop=Valor, Prop=Valor"
 *   - propriedades de componente: só as que existem, no tipo certo
 *   - medidas ligadas a variáveis só em campos que aceitam (e variável FLOAT)
 *   - quando a variável ligada a uma pintura muda, a opacidade vira a transparência da variável
 *     (para manter uma opacidade própria, aplique de novo com a mesma ligação)
 *   - instância de variante nasce com o nome do conjunto, não com "Prop=Valor"
 *   - outlineStroke devolve o contorno solto na página (quem chama recoloca)
 * Também mede o auto layout (abraçar, preencher, quebrar linha) para que width/height sejam realistas.
 */

let seq = 0;
const nextId = () => `${++seq}:${seq % 97}`;
let version = 0;
const touch = () => version++;
// Como no Figma: quando a variável ligada a uma pintura muda (ou a pintura passa a ter uma),
// a opacidade vira a transparência da variável; com a mesma ligação, a opacidade pedida fica.
const boundId = (p) => p?.boundVariables?.color?.id;
const settlePaints = (node, prev, list) => (list ?? []).map((p, i) => {
  const id = boundId(p);
  if (!id || id === boundId(prev?.[i])) return p;
  const alpha = node._figma._variables.find((v) => v.id === id)?._resolve()?.a ?? 1;
  return { ...p, opacity: alpha };
});

const BINDABLE = new Set([
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'itemSpacing', 'counterAxisSpacing',
  'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius',
  'bottomRightRadius', 'strokeWeight', 'strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight',
  'opacity', 'visible', 'characters',
]);

function fail(msg) {
  throw new Error(msg);
}

/* ───────── Nós ───────── */

class BaseNode {
  constructor(type, figma) {
    this.type = type;
    this.id = nextId();
    this.name = type.toLowerCase();
    this._figma = figma;
    this.parent = null;
    this.removed = false;
    this._pluginData = {};
    this.boundVariables = {};
  }
  setPluginData(k, v) { this._pluginData[k] = String(v); }
  getPluginData(k) { return this._pluginData[k] ?? ''; }
  remove() {
    if (this.parent) this.parent._detach(this);
    this.removed = true;
    for (const c of this.children ?? []) c._markRemoved();
    touch();
  }
  _markRemoved() {
    this.removed = true;
    for (const c of this.children ?? []) c._markRemoved();
  }
}

const SCENE_DEFAULTS = {
  x: 0, y: 0, visible: true, opacity: 1, rotation: 0, locked: false,
  fills: [], strokes: [], strokeWeight: 1, strokeAlign: 'INSIDE', dashPattern: [], effects: [],
  layoutPositioning: 'AUTO', layoutGrow: 0, layoutAlign: 'INHERIT', constraints: { horizontal: 'MIN', vertical: 'MIN' },
};

class SceneNode extends BaseNode {
  constructor(type, figma) {
    super(type, figma);
    Object.assign(this, structuredClone(SCENE_DEFAULTS));
    this._w = 100;
    this._h = 100;
    this._sizingH = null; // 'FIXED' | 'HUG' | 'FILL'
    this._sizingV = null;
    this.explicitVariableModes = {};
  }
  get width() { return this._figma._measure(this).w; }
  get height() { return this._figma._measure(this).h; }
  resize(w, h) {
    if (!(w >= 0.01 && h >= 0.01)) fail(`resize: tamanho inválido ${w}×${h} em "${this.name}"`);
    this._w = w;
    this._h = h;
    if (this.layoutMode && this.layoutMode !== 'NONE') {
      // como no Figma: redimensionar fixa os eixos que estavam abraçando
      if (this.layoutMode === 'HORIZONTAL') { this.primaryAxisSizingMode = 'FIXED'; this.counterAxisSizingMode = 'FIXED'; }
      else { this.primaryAxisSizingMode = 'FIXED'; this.counterAxisSizingMode = 'FIXED'; }
    }
    if (this.type === 'TEXT' && this.textAutoResize === 'WIDTH_AND_HEIGHT') this.textAutoResize = 'NONE';
    touch();
  }
  rescale(s) {
    if (!(s > 0)) fail('rescale: fator inválido');
    this._w = this.width * s;
    this._h = this.height * s;
    this._scale = (this._scale ?? 1) * s;
    touch();
  }
  setBoundVariable(field, variable) {
    if (!BINDABLE.has(field)) fail(`setBoundVariable: o campo "${field}" não aceita variável`);
    if (!variable || variable.removed) fail(`setBoundVariable: variável inválida em "${field}"`);
    const want = field === 'visible' ? 'BOOLEAN' : field === 'characters' ? 'STRING' : 'FLOAT';
    if (variable.resolvedType !== want) fail(`setBoundVariable: "${field}" pede variável ${want}, veio ${variable.resolvedType} (${variable.name})`);
    this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id };
    const v = variable._resolve();
    if (field === 'width') this._w = v;
    else if (field === 'height') this._h = v;
    else if (field === 'opacity') this.opacity = v > 1 ? v / 100 : v;
    else this[field] = v;
    touch();
  }
  setExplicitVariableModeForCollection(collection, modeId) {
    const col = typeof collection === 'string' ? this._figma._collections.find((c) => c.id === collection) : collection;
    if (!col || !col.modes.some((m) => m.modeId === modeId)) fail('setExplicitVariableModeForCollection: modo inválido');
    this.explicitVariableModes[col.id] = modeId;
  }
  // posição na página; filhos de grupo já estão no espaço do pai do grupo, como no Figma
  get absoluteTransform() {
    let x = this.x;
    let y = this.y;
    for (let p = this.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type !== 'GROUP') { x += p.x; y += p.y; }
    return [[1, 0, x], [0, 1, y]];
  }
  get fills() { return this._fills; }
  set fills(v) { this._fills = settlePaints(this, this._fills, v); }
  get strokes() { return this._strokes; }
  set strokes(v) { this._strokes = settlePaints(this, this._strokes, v); }
  get layoutSizingHorizontal() { return this._figma._sizing(this, 'H'); }
  set layoutSizingHorizontal(v) { this._figma._setSizing(this, 'H', v); }
  get layoutSizingVertical() { return this._figma._sizing(this, 'V'); }
  set layoutSizingVertical(v) { this._figma._setSizing(this, 'V', v); }
  async setEffectStyleIdAsync(id) {
    if (!this._figma._effectStyles.some((s) => s.id === id)) fail('setEffectStyleIdAsync: estilo inexistente');
    this.effectStyleId = id;
  }
  findAll(fn) {
    const out = [];
    const walk = (n) => (n.children ?? []).forEach((c) => { if (!fn || fn(c)) out.push(c); walk(c); });
    walk(this);
    return out;
  }
  findOne(fn) { return this.findAll(fn)[0] ?? null; }
  set componentPropertyReferences(refs) { this._figma._setRefs(this, refs); }
  get componentPropertyReferences() { return this._refs ?? null; }
}

const FRAME_DEFAULTS = {
  layoutMode: 'NONE', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'AUTO', itemSpacing: 0, counterAxisSpacing: 0,
  paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
  layoutWrap: 'NO_WRAP', clipsContent: true, topLeftRadius: 0, topRightRadius: 0, bottomLeftRadius: 0, bottomRightRadius: 0,
  strokeTopWeight: 1, strokeRightWeight: 1, strokeBottomWeight: 1, strokeLeftWeight: 1, description: '',
};

class ContainerNode extends SceneNode {
  constructor(type, figma) {
    super(type, figma);
    Object.assign(this, structuredClone(FRAME_DEFAULTS));
    this.children = [];
    if (type === 'FRAME' || type === 'COMPONENT' || type === 'INSTANCE') this.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  }
  set layoutWrap(v) {
    if (v === 'WRAP' && this.layoutMode !== 'HORIZONTAL') fail(`layoutWrap WRAP só funciona com layoutMode HORIZONTAL ("${this.name}")`);
    this._wrap = v;
  }
  get layoutWrap() { return this._wrap ?? 'NO_WRAP'; }
  set counterAxisSpacing(v) { this._cas = v; }
  get counterAxisSpacing() { return this._cas ?? 0; }
  set strokeWeight(v) { this._sw = v; if (this.strokeTopWeight !== undefined) { this.strokeTopWeight = v; this.strokeRightWeight = v; this.strokeBottomWeight = v; this.strokeLeftWeight = v; } }
  get strokeWeight() { return this._sw ?? 1; }
  appendChild(child) { this.insertChild(this.children.length, child); }
  insertChild(index, child) {
    if (this.removed) fail(`appendChild em nó removido ("${this.name}")`);
    if (child === this) fail('um nó não pode conter a si mesmo');
    if (this.type === 'COMPONENT_SET' && child.type !== 'COMPONENT') fail(`conjunto de variantes só aceita componentes (veio ${child.type} "${child.name}")`);
    if (child.type === 'COMPONENT' && child._insideComponent?.(this)) fail('componente não pode ficar dentro de outro componente');
    for (let p = this; p; p = p.parent) if (p === child) fail('ciclo: o nó é ancestral do novo pai');
    if (child.parent) child.parent._detach(child);
    child.parent = this;
    this.children.splice(Math.min(index, this.children.length), 0, child);
    if (this.type === 'COMPONENT_SET') this._figma._syncVariantProps(this);
    touch();
  }
  _detach(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
    child.parent = null;
    if (this.type === 'COMPONENT_SET') this._figma._syncVariantProps(this);
    touch();
  }
}

class ComponentNode extends ContainerNode {
  constructor(figma) {
    super('COMPONENT', figma);
    this.key = `key-${this.id}`;
    this._defs = {};
  }
  _insideComponent(target) {
    for (let p = target; p; p = p.parent) if (p.type === 'COMPONENT' || p.type === 'INSTANCE') return true;
    return false;
  }
  createInstance() { return this._figma._instanceOf(this); }
  get componentPropertyDefinitions() {
    if (this.parent?.type === 'COMPONENT_SET') fail('variantes não têm definições próprias: leia do conjunto');
    return structuredClone(this._defs);
  }
  addComponentProperty(name, type, def) {
    if (this.parent?.type === 'COMPONENT_SET') fail('em variantes, adicione a propriedade no conjunto');
    const key = `${name}#${nextId()}`;
    this._defs[key] = { type, defaultValue: def };
    return key;
  }
}

class ComponentSetNode extends ContainerNode {
  constructor(figma) {
    super('COMPONENT_SET', figma);
    this.fills = [];
    this._defs = {};
    this.key = `key-${this.id}`;
  }
  get componentPropertyDefinitions() { return structuredClone(this._defs); }
  addComponentProperty(name, type, def, opts) {
    if (!['TEXT', 'BOOLEAN', 'INSTANCE_SWAP'].includes(type)) fail(`addComponentProperty: tipo ${type} não pode ser adicionado assim`);
    if (Object.keys(this._defs).some((k) => k.split('#')[0] === name)) fail(`addComponentProperty: já existe "${name}"`);
    if (type === 'INSTANCE_SWAP' && !this._figma._byId(def)) fail('INSTANCE_SWAP: o padrão precisa ser o id de um componente');
    if (type === 'BOOLEAN' && typeof def !== 'boolean') fail('BOOLEAN: padrão precisa ser true/false');
    const key = `${name}#${nextId()}`;
    this._defs[key] = { type, defaultValue: def, preferredValues: opts?.preferredValues };
    return key;
  }
}

class TextNode extends SceneNode {
  constructor(figma) {
    super('TEXT', figma);
    this._chars = '';
    this.fontName = { family: 'Inter', style: 'Regular' };
    this.fontSize = 12;
    this.textAutoResize = 'WIDTH_AND_HEIGHT';
    this.textAlignHorizontal = 'LEFT';
    this.lineHeight = { unit: 'AUTO' };
    this.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
  }
  get characters() { return this._chars; }
  set characters(v) {
    if (!this._figma._fontLoaded(this.fontName)) fail(`texto "${String(v).slice(0, 20)}": a fonte ${this.fontName.family} ${this.fontName.style} não foi carregada (loadFontAsync)`);
    this._chars = String(v);
    touch();
  }
  async setTextStyleIdAsync(id) {
    const st = this._figma._textStyles.find((s) => s.id === id);
    if (!st) fail('setTextStyleIdAsync: estilo inexistente');
    if (!this._figma._fontLoaded(st.fontName)) fail(`estilo ${st.name}: fonte não carregada`);
    this.textStyleId = id;
    this.fontName = st.fontName;
    this.fontSize = st.fontSize;
    this.lineHeight = st.lineHeight;
    this.letterSpacing = st.letterSpacing;
    touch();
  }
}

class ShapeNode extends SceneNode {
  constructor(type, figma) {
    super(type, figma);
    this.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 }, opacity: 1 }];
    this.topLeftRadius = 0; this.topRightRadius = 0; this.bottomLeftRadius = 0; this.bottomRightRadius = 0;
  }
}

class PageNode extends BaseNode {
  constructor(figma, name) {
    super('PAGE', figma);
    this.name = name;
    this.children = [];
    this.backgrounds = [];
    this._loaded = false;
  }
  async loadAsync() { this._loaded = true; }
  appendChild(c) { this.insertChild(this.children.length, c); }
  insertChild(i, c) {
    if (c.parent) c.parent._detach(c);
    c.parent = this;
    this.children.splice(i, 0, c);
    touch();
  }
  _detach(c) {
    const i = this.children.indexOf(c);
    if (i >= 0) this.children.splice(i, 1);
    c.parent = null;
  }
  findAll(fn) {
    if (!this._loaded) fail(`página "${this.name}" não carregada (loadAsync) — documentAccess: dynamic-page`);
    const out = [];
    const walk = (n) => (n.children ?? []).forEach((c) => { if (!fn || fn(c)) out.push(c); walk(c); });
    walk(this);
    return out;
  }
  findOne(fn) { return this.findAll(fn)[0] ?? null; }
}

/* ───────── Variáveis ───────── */

class Variable {
  constructor(figma, name, collection, type) {
    this._figma = figma;
    this.id = `VariableID:${nextId()}`;
    this.name = name;
    this.variableCollectionId = collection.id;
    this.resolvedType = type;
    this.valuesByMode = {};
    this.description = '';
    this.scopes = ['ALL_SCOPES'];
    this.codeSyntax = {};
    this.removed = false;
  }
  setValueForMode(modeId, value) {
    const col = this._figma._collections.find((c) => c.id === this.variableCollectionId);
    if (!col.modes.some((m) => m.modeId === modeId)) fail(`setValueForMode: modo inexistente em ${this.name}`);
    if (value?.type === 'VARIABLE_ALIAS') {
      const target = this._figma._variables.find((v) => v.id === value.id);
      if (!target) fail(`alias para variável inexistente (${this.name})`);
      if (target.resolvedType !== this.resolvedType) fail(`alias de tipo diferente: ${this.name} → ${target.name}`);
    } else if (this.resolvedType === 'COLOR' && !(value && 'r' in value)) fail(`cor inválida em ${this.name}`);
    else if (this.resolvedType === 'FLOAT' && typeof value !== 'number') fail(`número inválido em ${this.name}`);
    this.valuesByMode[modeId] = value;
  }
  setVariableCodeSyntax(platform, value) { this.codeSyntax[platform] = value; }
  remove() { this.removed = true; this._figma._variables.splice(this._figma._variables.indexOf(this), 1); }
  _resolve(modeId) {
    const col = this._figma._collections.find((c) => c.id === this.variableCollectionId);
    const v = this.valuesByMode[modeId ?? col.modes[0].modeId] ?? Object.values(this.valuesByMode)[0];
    if (v?.type === 'VARIABLE_ALIAS') return this._figma._variables.find((x) => x.id === v.id)._resolve();
    return v;
  }
}

class VariableCollection {
  constructor(figma, name) {
    this._figma = figma;
    this.id = `VariableCollectionId:${nextId()}`;
    this.name = name;
    this.modes = [{ modeId: `${nextId()}`, name: 'Mode 1' }];
    this.hiddenFromPublishing = false;
  }
  renameMode(id, name) { const m = this.modes.find((x) => x.modeId === id); if (!m) fail('renameMode: modo inexistente'); m.name = name; }
  addMode(name) {
    // o plano gratuito do Figma aceita um modo só por coleção (mensagem igual à do Figma)
    const max = this._figma._maxModes;
    if (this.modes.length >= max) fail(`in addMode: Limited to ${max} modes only`);
    const m = { modeId: `${nextId()}`, name };
    this.modes.push(m);
    return m.modeId;
  }
  get defaultModeId() { return this.modes[0].modeId; }
}

/* ───────── O objeto figma ───────── */

export function createMockFigma({ missingFonts = [], maxModes = Infinity } = {}) {
  const figma = {
    _maxModes: maxModes,
    _collections: [],
    _variables: [],
    _textStyles: [],
    _effectStyles: [],
    _loadedFonts: new Set(),
    _all: new Map(),
    _missing: new Set(missingFonts),
    notifications: [],
    closed: null,
  };
  const reg = (n) => { figma._all.set(n.id, n); return n; };
  const firstPage = reg(new PageNode(figma, 'Page 1'));
  firstPage._loaded = true;
  figma.root = { type: 'DOCUMENT', children: [firstPage] };
  figma.currentPage = firstPage;

  figma._byId = (id) => figma._all.get(id) ?? null;
  figma.getNodeByIdAsync = async (id) => { const n = figma._all.get(id); return n && !n.removed ? n : null; };
  figma._fontLoaded = (f) => figma._loadedFonts.has(`${f.family}/${f.style}`);

  const place = (n) => { figma.currentPage.appendChild(n); return reg(n); };
  figma.createFrame = () => place(new ContainerNode('FRAME', figma));
  figma.createComponent = () => place(new ComponentNode(figma));
  figma.createText = () => place(new TextNode(figma));
  figma.createRectangle = () => place(new ShapeNode('RECTANGLE', figma));
  figma.createEllipse = () => place(new ShapeNode('ELLIPSE', figma));
  figma.createPage = () => { const p = reg(new PageNode(figma, 'Page')); figma.root.children.push(p); return p; };
  figma.setCurrentPageAsync = async (p) => { if (!p._loaded) fail('setCurrentPageAsync: carregue a página antes'); figma.currentPage = p; };
  figma.loadAllPagesAsync = async () => figma.root.children.forEach((p) => (p._loaded = true));
  figma.loadFontAsync = async (f) => {
    if (figma._missing.has(f.family)) fail(`fonte indisponível: ${f.family}`);
    figma._loadedFonts.add(`${f.family}/${f.style}`);
  };
  figma.notify = (m) => figma.notifications.push(m);
  figma.closePlugin = (m) => (figma.closed = m ?? '');

  figma.createNodeFromSvg = (svg) => {
    const frame = place(new ContainerNode('FRAME', figma));
    frame.fills = [];
    const w = Number(/width="([\d.]+)"/.exec(svg)?.[1] ?? 24);
    const h = Number(/height="([\d.]+)"/.exec(svg)?.[1] ?? w);
    const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? `0 0 ${w} ${h}`;
    frame._w = w;
    frame._h = h;
    const shapes = svg.match(/<(path|circle|rect|line|polyline|ellipse)\b[^>]*>/g) ?? [];
    if (!shapes.length) fail('createNodeFromSvg: SVG sem formas');
    // <g> vira GROUP, como no Figma (e grupo não tem constraints)
    let target = frame;
    const groupFill = /<g\b[^>]*fill="(?!none)[^"]+"/.test(svg);
    if (/<g\b/.test(svg)) {
      const g = reg(new ContainerNode('GROUP', figma));
      g.fills = [];
      Object.defineProperty(g, 'constraints', { enumerable: false, get() { return undefined; }, set() { fail("node.constraints: no such property 'constraints' on GROUP node"); } });
      g.name = 'Group';
      frame.appendChild(g);
      target = g;
    }
    for (const s of shapes) {
      const v = reg(new ShapeNode('VECTOR', figma));
      v.name = 'Vector';
      const filled = /fill="(?!none)[^"]+"/.test(s) || (target !== frame && groupFill);
      v.fills = filled ? [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: Number(/fill-opacity="([\d.]+)"/.exec(s)?.[1] ?? 1) }] : [];
      // como no Figma: o fill do <g> soma ao traço herdado do <svg>; só stroke="none" tira o traço
      const ownFill = /fill="(?!none)[^"]+"/.test(s);
      v.strokes = /stroke="none"/.test(s) || (ownFill && !/stroke="(?!none)/.test(s)) ? [] : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
      v.strokeWeight = Number(/stroke-width="([\d.]+)"/.exec(svg)?.[1] ?? 1);
      v._svg = s;
      v._viewBox = viewBox;
      v._w = w; v._h = h;
      target.appendChild(v);
    }
    frame._svg = svg;
    return frame;
  };

  // partes de um vetor para a prévia: cada forma do SVG e se ela é traço ou preenchimento
  const partsOf = (n) => n._parts ?? (n._svg ? [{ svg: n._svg, role: n.strokes?.length ? 'stroke' : 'fill', weight: n.strokeWeight }] : []);
  const leavesOf = (n) => (n.children ? n.children.flatMap(leavesOf) : [n]);
  const sameParent = (nodes, fn) => {
    if (!nodes.length) fail(`${fn}: lista vazia`);
    if (nodes.some((n) => n.removed)) fail(`${fn}: nó removido`);
  };
  ShapeNode.prototype.outlineStroke = function outlineStroke() {
    if (!this.strokes?.length) return null;
    const o = reg(new ShapeNode('VECTOR', figma));
    o.name = this.name;
    o.fills = this.strokes.map((p) => ({ ...p }));
    o.strokes = [];
    o._parts = [{ svg: this._svg, role: 'stroke', weight: this.strokeWeight }];
    o._viewBox = this._viewBox;
    o._w = this._w; o._h = this._h;
    // como no Figma: o contorno nasce solto na página, não ao lado da forma
    figma.currentPage.appendChild(o);
    o.x = this.x - this.strokeWeight / 2;
    o.y = this.y - this.strokeWeight / 2;
    return o;
  };
  figma.union = (nodes, parent) => {
    sameParent(nodes, 'union');
    const b = reg(new ContainerNode('BOOLEAN_OPERATION', figma));
    b.booleanOperation = 'UNION';
    b.name = 'Union';
    b.fills = (nodes[0].fills ?? []).map((p) => ({ ...p }));
    b.clipsContent = false;
    (parent ?? nodes[0].parent).appendChild(b);
    for (const n of nodes) b.appendChild(n);
    b._w = nodes[0]._w; b._h = nodes[0]._h;
    return b;
  };
  figma.flatten = (nodes, parent) => {
    sameParent(nodes, 'flatten');
    const v = reg(new ShapeNode('VECTOR', figma));
    v.name = 'Vector';
    v.fills = (nodes[0].fills ?? []).map((p) => ({ ...p }));
    v.strokes = [];
    v._parts = nodes.flatMap(leavesOf).flatMap(partsOf);
    v._viewBox = leavesOf(nodes[0])[0]?._viewBox;
    v._w = nodes[0]._w; v._h = nodes[0]._h;
    (parent ?? nodes[0].parent).appendChild(v);
    for (const n of nodes) n.remove();
    return v;
  };

  figma.combineAsVariants = (nodes, parent) => {
    if (!nodes.length) fail('combineAsVariants: lista vazia');
    if (!nodes.every((n) => n.type === 'COMPONENT')) fail('combineAsVariants: só componentes');
    nodes.forEach((n) => { if (!/^[^=,]+=[^=,]+(, [^=,]+=[^=,]+)*$/.test(n.name)) fail(`nome de variante inválido: "${n.name}"`); });
    const names = nodes.map((n) => n.name);
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) fail(`variantes repetidas: "${dup}"`);
    const set = reg(new ComponentSetNode(figma));
    parent.appendChild(set);
    nodes.forEach((n) => set.appendChild(n));
    return set;
  };

  figma._syncVariantProps = (set) => {
    const props = {};
    for (const c of set.children) {
      for (const part of c.name.split(', ')) {
        const [k, v] = part.split('=');
        if (!k || v === undefined) continue;
        (props[k] ??= new Set()).add(v);
      }
    }
    for (const k of Object.keys(set._defs)) if (set._defs[k].type === 'VARIANT') delete set._defs[k];
    for (const [k, vals] of Object.entries(props)) set._defs[k] = { type: 'VARIANT', defaultValue: [...vals][0], variantOptions: [...vals] };
  };

  figma._setRefs = (node, refs) => {
    let comp = node;
    while (comp && comp.type !== 'COMPONENT') comp = comp.parent;
    if (!comp) fail(`componentPropertyReferences fora de componente ("${node.name}")`);
    const defs = comp.parent?.type === 'COMPONENT_SET' ? comp.parent._defs : comp._defs;
    for (const [field, key] of Object.entries(refs)) {
      const def = defs[key];
      if (!def) fail(`referência para propriedade inexistente: ${key}`);
      if (field === 'characters' && (node.type !== 'TEXT' || def.type !== 'TEXT')) fail('characters: só texto ↔ propriedade TEXT');
      if (field === 'visible' && def.type !== 'BOOLEAN') fail('visible: só propriedade BOOLEAN');
      if (field === 'mainComponent' && (node.type !== 'INSTANCE' || def.type !== 'INSTANCE_SWAP')) fail('mainComponent: só instância ↔ INSTANCE_SWAP');
      if (!['characters', 'visible', 'mainComponent'].includes(field)) fail(`campo de referência inválido: ${field}`);
    }
    node._refs = refs;
    // como no Figma: a camada ligada mostra o padrão da propriedade (todas as variantes iguais)
    if (refs.characters) node._chars = String(defs[refs.characters].defaultValue);
    if (refs.visible) node.visible = defs[refs.visible].defaultValue !== false;
    for (let p = node.parent; p && p !== comp; p = p.parent) if (p.type === 'INSTANCE') fail(`componentPropertyReferences em camada dentro de instância ("${node.name}")`);
  };

  // instância: cópia do conteúdo do componente, mantendo as referências às propriedades
  figma._instanceOf = (main) => {
    const inst = place(new ContainerNode('INSTANCE', figma));
    copyInto(main, inst);
    inst.mainComponent = main;
    inst.name = main.parent?.type === 'COMPONENT_SET' ? main.parent.name : main.name;
    Object.defineProperty(inst, 'componentProperties', {
      get() {
        const defs = main.parent?.type === 'COMPONENT_SET' ? main.parent._defs : main._defs;
        const out = {};
        for (const [k, d] of Object.entries(defs)) out[k] = { type: d.type, value: inst._props?.[k] ?? d.defaultValue };
        return out;
      },
    });
    inst._props = {};
    inst.setProperties = (map) => {
      const defs = inst.componentProperties;
      for (const [k, v] of Object.entries(map)) {
        if (!defs[k]) fail(`setProperties: propriedade inexistente "${k}" em ${main.name}`);
        if (defs[k].type === 'BOOLEAN' && typeof v !== 'boolean') fail(`setProperties: "${k}" pede booleano`);
        if (defs[k].type === 'INSTANCE_SWAP' && !figma._byId(v)) fail(`setProperties: "${k}" pede id de componente`);
        inst._props[k] = v;
      }
      applyProps(inst);
      touch();
    };
    applyProps(inst);
    return inst;
  };

  function copyInto(src, dst) {
    const skip = new Set(['id', 'parent', 'children', '_figma', '_pluginData', 'type', 'key', '_defs', 'removed', 'mainComponent', 'setProperties', '_props', '_refs']);
    for (const k of Object.keys(src)) if (!skip.has(k)) dst[k] = structuredClone(src[k]);
    dst._refs = src._refs ? { ...src._refs } : undefined;
    dst.children = [];
    for (const c of src.children ?? []) {
      let copy;
      if (c.type === 'INSTANCE') copy = figma._instanceOf(c.mainComponent);
      else if (c.type === 'TEXT') copy = reg(new TextNode(figma));
      else if (c.children) copy = reg(new ContainerNode(c.type === 'COMPONENT' ? 'FRAME' : c.type, figma));
      else copy = reg(new ShapeNode(c.type, figma));
      if (copy.parent) copy.parent._detach(copy);
      copyInto(c, copy);
      if (c.type === 'INSTANCE') copy.mainComponent = c.mainComponent;
      copy.parent = dst;
      dst.children.push(copy);
    }
  }

  function applyProps(inst) {
    const props = inst.componentProperties;
    const walk = (n) => (n.children ?? []).forEach((c) => {
      if (c._refs) {
        for (const [field, key] of Object.entries(c._refs)) {
          const p = props[key];
          if (!p) continue;
          if (field === 'characters') c._chars = String(p.value);
          if (field === 'visible') c.visible = !!p.value;
          if (field === 'mainComponent') {
            const m = figma._byId(p.value);
            if (m && c.mainComponent !== m) {
              // como no Figma: troca o conteúdo e mantém as sobreposições de cor nas camadas de mesmo papel
              const old = (c.children ?? []).find((x) => x.type === 'VECTOR');
              const strokePaint = old?.strokes?.[0];
              const fillPaint = (c.children ?? []).find((x) => x.type === 'VECTOR' && x.fills?.length)?.fills?.[0];
              c.children.forEach((x) => x._markRemoved());
              c.children = [];
              for (const child of m.children ?? []) {
                const copy = reg(child.children ? new ContainerNode(child.type, figma) : new ShapeNode(child.type, figma));
                if (copy.parent) copy.parent._detach(copy);
                copyInto(child, copy);
                if (copy.type === 'VECTOR') {
                  if (strokePaint && copy.strokes?.length) copy.strokes = [structuredClone(strokePaint)];
                  if (fillPaint && copy.fills?.length) copy.fills = [{ ...structuredClone(fillPaint), opacity: copy.fills[0].opacity }];
                }
                copy.parent = c;
                c.children.push(copy);
              }
              c.mainComponent = m;
              c._swappedTo = m.name;
            }
          }
        }
      }
      walk(c);
    });
    walk(inst);
  }

  /* layout: sizing e medida */
  figma._sizing = (n, axis) => {
    const explicit = axis === 'H' ? n._sizingH : n._sizingV;
    if (explicit) return explicit;
    if (n.type === 'TEXT') return n.textAutoResize === 'WIDTH_AND_HEIGHT' || (axis === 'V' && n.textAutoResize === 'HEIGHT') ? 'HUG' : 'FIXED';
    if (n.layoutMode && n.layoutMode !== 'NONE') {
      const primary = (n.layoutMode === 'HORIZONTAL') === (axis === 'H');
      return (primary ? n.primaryAxisSizingMode : n.counterAxisSizingMode) === 'AUTO' ? 'HUG' : 'FIXED';
    }
    return 'FIXED';
  };
  figma._setSizing = (n, axis, v) => {
    const parentAL = n.parent && n.parent.layoutMode && n.parent.layoutMode !== 'NONE';
    if (v === 'FILL' && !parentAL) fail(`layoutSizing FILL só em filho de auto layout ("${n.name}" está em ${n.parent?.type ?? 'nada'} sem auto layout)`);
    if (v === 'HUG' && !(n.type === 'TEXT' || (n.layoutMode && n.layoutMode !== 'NONE'))) fail(`layoutSizing HUG só em auto layout ou texto ("${n.name}")`);
    // só FILL fica guardado; HUG e FIXED viram o modo do eixo (ou o autoajuste do texto), como no Figma
    if (axis === 'H') n._sizingH = v === 'FILL' ? 'FILL' : null; else n._sizingV = v === 'FILL' ? 'FILL' : null;
    if (n.type === 'TEXT' && v === 'HUG') n.textAutoResize = axis === 'H' ? 'WIDTH_AND_HEIGHT' : n.textAutoResize === 'NONE' ? 'HEIGHT' : n.textAutoResize;
    if (n.type === 'TEXT' && v === 'FIXED') n.textAutoResize = axis === 'H' ? (n.textAutoResize === 'WIDTH_AND_HEIGHT' ? 'HEIGHT' : n.textAutoResize) : 'NONE';
    if (n.layoutMode && n.layoutMode !== 'NONE' && v !== 'FILL') {
      const primary = (n.layoutMode === 'HORIZONTAL') === (axis === 'H');
      if (primary) n.primaryAxisSizingMode = v === 'HUG' ? 'AUTO' : 'FIXED';
      else n.counterAxisSizingMode = v === 'HUG' ? 'AUTO' : 'FIXED';
    }
    if (n.type === 'TEXT' && v === 'FILL' && axis === 'H' && n.textAutoResize === 'WIDTH_AND_HEIGHT') n.textAutoResize = 'HEIGHT';
    touch();
  };

  const cache = new WeakMap();
  // mede um bloco do zero e devolve as linhas horizontais que vazam (só para o teste)
  let overflowSink = null;
  figma._overflowsOf = (root) => {
    const out = [];
    overflowSink = out;
    try { measure(root, null, null); } finally { overflowSink = null; }
    return out;
  };

  figma._measure = (n) => {
    const hit = cache.get(n);
    if (hit && hit.v === version) return hit.r;
    const r = measure(n, null, null);
    cache.set(n, { v: version, r });
    return r;
  };

  function textSize(t, maxW) {
    const size = t.fontSize || 12;
    const lh = t.lineHeight?.unit === 'PIXELS' ? t.lineHeight.value : size * 1.3;
    const charW = size * (/Mono/.test(t.fontName.family) ? 0.6 : /Tight/.test(t.fontName.family) ? 0.5 : 0.54);
    const raw = Math.max(1, t._chars.length * charW);
    const fixedW = t.textAutoResize === 'WIDTH_AND_HEIGHT' ? null : maxW ?? t._w;
    if (!fixedW) return { w: raw, h: lh };
    const lines = Math.max(1, Math.ceil(raw / Math.max(1, fixedW)));
    return { w: fixedW, h: t.textAutoResize === 'NONE' ? t._h : lines * lh };
  }

  // forced: tamanho imposto pelo pai (FILL) em cada eixo
  function measure(n, forcedW, forcedH) {
    if (n.type === 'TEXT') {
      const s = textSize(n, forcedW ?? (n._sizingH === 'FILL' ? null : undefined));
      return { w: forcedW ?? s.w, h: forcedH ?? s.h };
    }
    const al = n.layoutMode && n.layoutMode !== 'NONE';
    if (!al || !n.children) {
      const s = n._scale ?? 1;
      return { w: forcedW ?? n._w, h: forcedH ?? n._h, scale: s };
    }
    const H = n.layoutMode === 'HORIZONTAL';
    const hugW = figma._sizing(n, 'H') === 'HUG' && forcedW == null;
    const hugH = figma._sizing(n, 'V') === 'HUG' && forcedH == null;
    const w0 = forcedW ?? (hugW ? null : n._w);
    const h0 = forcedH ?? (hugH ? null : n._h);
    const padX = n.paddingLeft + n.paddingRight;
    const padY = n.paddingTop + n.paddingBottom;
    const kids = n.children.filter((c) => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
    const innerW = w0 != null ? w0 - padX : null;
    const innerH = h0 != null ? h0 - padY : null;
    const sizeOf = (c, availMain) => {
      const fillW = figma._sizing(c, 'H') === 'FILL' || (H && c.layoutGrow === 1);
      const fillH = figma._sizing(c, 'V') === 'FILL' || (!H && c.layoutGrow === 1);
      const fw = fillW ? (H ? availMain : innerW) : null;
      const fh = fillH ? (H ? innerH : availMain) : null;
      return measure(c, fw ?? null, fh ?? null);
    };
    if (H && n.layoutWrap === 'WRAP' && innerW != null) {
      let x = 0, rowH = 0, total = 0, rows = 0, maxRow = 0;
      for (const c of kids) {
        const s = sizeOf(c, null);
        if (x > 0 && x + s.w > innerW + 0.5) { total += rowH + n.counterAxisSpacing; x = 0; rowH = 0; rows++; }
        x += s.w + n.itemSpacing;
        maxRow = Math.max(maxRow, x - n.itemSpacing);
        rowH = Math.max(rowH, s.h);
      }
      total += rowH;
      return { w: w0 ?? maxRow + padX, h: h0 ?? total + padY };
    }
    // principal: primeiro os que não crescem, depois os que preenchem
    let used = 0, cross = 0;
    const growers = [];
    for (const c of kids) {
      const grows = H ? (figma._sizing(c, 'H') === 'FILL' || c.layoutGrow === 1) : (figma._sizing(c, 'V') === 'FILL' || c.layoutGrow === 1);
      if (grows && (H ? innerW : innerH) != null) { growers.push(c); continue; }
      const s = sizeOf(c, null);
      used += H ? s.w : s.h;
      cross = Math.max(cross, H ? s.h : s.w);
    }
    const gaps = Math.max(0, kids.length - 1) * (n.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 0 : n.itemSpacing);
    const avail = ((H ? innerW : innerH) ?? 0) - used - gaps;
    // linha que não cabe na largura que o pai deu: no Figma o conteúdo vaza pela borda
    // (FILL dentro de pai que abraça fica de fora: aqui a largura dele não é conhecida)
    if (overflowSink && H && innerW != null && (forcedW != null || figma._sizing(n, 'H') === 'FIXED') && !n.clipsContent && avail < -1) overflowSink.push({ node: n, need: Math.round(used + gaps + padX), have: Math.round(w0) });
    for (const c of growers) {
      const s = sizeOf(c, Math.max(0, avail / growers.length));
      cross = Math.max(cross, H ? s.h : s.w);
    }
    const mainSize = used + gaps + (growers.length ? Math.max(0, avail) : 0);
    // pilha vertical com um filho mais largo que ela: o filho vaza pela borda (no Figma também)
    if (overflowSink && !H && innerW != null && (forcedW != null || figma._sizing(n, 'H') === 'FIXED') && !n.clipsContent && cross > innerW + 1) overflowSink.push({ node: n, need: Math.round(cross + padX), have: Math.round(w0) });
    return {
      w: w0 ?? (H ? mainSize : cross) + padX,
      h: h0 ?? (H ? cross : mainSize) + padY,
    };
  }

  /* variáveis */
  figma.variables = {
    getLocalVariableCollectionsAsync: async () => figma._collections.slice(),
    getLocalVariablesAsync: async () => figma._variables.slice(),
    createVariableCollection: (name) => { const c = new VariableCollection(figma, name); figma._collections.push(c); return c; },
    createVariable: (name, collection, type) => {
      if (typeof collection === 'string') fail('createVariable: passe a coleção (objeto), não o id');
      if (figma._variables.some((v) => v.variableCollectionId === collection.id && v.name === name)) fail(`variável repetida: ${name}`);
      const v = new Variable(figma, name, collection, type);
      figma._variables.push(v);
      return v;
    },
    createVariableAlias: (v) => { if (!v) fail('createVariableAlias: variável indefinida'); return { type: 'VARIABLE_ALIAS', id: v.id }; },
    setBoundVariableForPaint: (p, field, v) => {
      if (field !== 'color') fail('setBoundVariableForPaint: só "color"');
      if (!v || v.resolvedType !== 'COLOR') fail(`setBoundVariableForPaint: precisa de variável COLOR (${v?.name})`);
      return { ...p, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } }, _var: v.name };
    },
    setBoundVariableForEffect: (e, field, v) => {
      if (field !== 'color' && field !== 'radius' && field !== 'spread') fail('setBoundVariableForEffect: campo inválido');
      return { ...e, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } }, _var: v.name };
    },
    getVariableById: (id) => figma._variables.find((v) => v.id === id) ?? null,
  };

  figma.getLocalTextStylesAsync = async () => figma._textStyles.slice();
  figma.getLocalEffectStylesAsync = async () => figma._effectStyles.slice();
  figma.createTextStyle = () => {
    const s = {
      id: `S:${nextId()}`, name: '', description: '', fontSize: 12, lineHeight: { unit: 'AUTO' }, letterSpacing: { unit: 'PERCENT', value: 0 }, textCase: 'ORIGINAL',
      _font: { family: 'Inter', style: 'Regular' },
    };
    Object.defineProperty(s, 'fontName', {
      get() { return this._font; },
      set(f) { if (!figma._fontLoaded(f)) fail(`estilo de texto: fonte ${f.family} ${f.style} não carregada`); this._font = f; },
    });
    figma._textStyles.push(s);
    return s;
  };
  figma.createEffectStyle = () => { const s = { id: `S:${nextId()}`, name: '', description: '', effects: [] }; figma._effectStyles.push(s); return s; };

  return figma;
}
