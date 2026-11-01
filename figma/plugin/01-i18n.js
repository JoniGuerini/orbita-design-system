/**
 * Idiomas do plugin: português, inglês e espanhol.
 *
 * O código dos blocos é escrito em português, e é em português que ficam as chaves internas
 * (orbita-key, variantes, propriedades, modos): trocar o idioma renomeia o que já existe, sem duplicar.
 * A tradução acontece na hora de escrever no Figma — text(), box(), shape(), nomes de componentes,
 * propriedades, páginas, coleções, modos e descrições passam por L().
 *
 * L(texto) procura o texto em DICT (02-dicionario.js), depois nas regras (textos com números) e, se
 * houver “ · ”, traduz cada parte. Frases montadas no código com valores usam L3(pt, en, es).
 * Texto que não está no dicionário volta como veio e vai para MISSING — o figma:test acusa.
 *
 * Palavras ambíguas: 'grafico-linhas|Linha' vale só dentro daquele bloco (ORB.block) e 'Tipo=Linha' só
 * para o valor daquela propriedade de variante. Nomes de variantes e de propriedades nunca usam o
 * contexto do bloco (Lg): outro bloco precisa achar a mesma variante pelo mesmo nome.
 */

var LANGS = ['pt-BR', 'en', 'es'];
var LANG = 'pt-BR';
var MISSING = {}; // texto sem tradução → bloco onde apareceu (o figma:test lê)
var OUT = {}; // textos já traduzidos: passar de novo por L() não muda nada
var DICT = {}; // preenchido em 02-dicionario.js: { 'Português': ['English', 'Español'] }
var RULES = []; // idem: [regex, function (m) { return L3(…) }]
var SAME = {}; // idem: textos iguais nas três línguas (nomes próprios, termos técnicos)

function setLang(lang) {
  LANG = LANGS.indexOf(lang) >= 0 ? lang : 'en';
}

/** Roda fn com outro idioma ativo (para achar o nome de algo em qualquer língua). */
function withLang(lang, fn) {
  var prev = LANG;
  LANG = lang;
  try { return fn(); } finally { LANG = prev; }
}

/** O mesmo texto nas três línguas — para achar páginas, coleções e modos criados em outro idioma. */
function anyLang(s) {
  return LANGS.map(function (l) { return withLang(l, function () { return L(s, true); }); });
}

/** Texto no idioma ativo, escrito na hora: L3('Bloco', 'Block', 'Bloque'). */
function L3(pt, en, es) {
  var out = LANG === 'en' ? en : LANG === 'es' ? es : pt;
  OUT[out] = true;
  return out;
}

/** Inglês usa ponto decimal e vírgula de milhar: 4,5 → 4.5 e 12.480 → 12,480 (fora de código). */
function enNumbers(s) {
  if (/[;{}()=<>]/.test(s)) return s;
  return s
    .replace(/(^|[^\d.,])([1-9]\d{0,2}(?:\.\d{3})+)(?![\d\w])/g, function (m, pre, n) { return pre + n.replace(/\./g, '\u0001'); })
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\u0001/g, ',');
}

function needsTranslation(s) {
  if (OUT[s] || SAME[s]) return false;
  if (!/[A-Za-zÀ-ÿ]{2}/.test(s)) return false;
  // código, tokens e nomes de ícone: color/bg/canvas, .ds-btn, arrow-right, var(--x), 0.125rem
  if (!/\s/.test(s) && (/[/.#(_=:]/.test(s) || /^[a-z][a-z0-9-]*$/.test(s))) return false;
  // valores: oklch(98.8% 0.006 70), 24 px, 150 ms
  if (/^[a-z-]+\(.*\)$/.test(s) || /^[−+-]?[\d.,]+\s?(px|ms|rem|em|s|%|pt|KB|MB|GB)$/.test(s) || /^\S+@\S+$/.test(s)) return false;
  return true;
}

function pickLang(hit) {
  return LANG === 'es' && hit[1] !== undefined ? hit[1] : hit[0];
}

/** Sem o contexto do bloco: para nomes de propriedades e valores de variantes. */
function Lg(s) {
  return L(s, true);
}

/** Valor de uma propriedade de variante: { Tipo: 'Linha' } procura 'Tipo=Linha' antes de 'Linha'. */
function LV(prop, value) {
  if (LANG === 'pt-BR') return String(value);
  var hit = DICT[prop + '=' + value];
  if (!hit) return Lg(value);
  var t = pickLang(hit);
  OUT[t] = true;
  return t;
}

function L(s, global) {
  if (s === undefined || s === null) return s;
  s = String(s);
  if (LANG === 'pt-BR' || s === '') return s;
  var hit = (!global && ORB.block && DICT[ORB.block + '|' + s]) || DICT[s];
  if (hit) {
    var t = pickLang(hit);
    OUT[t] = true;
    return t;
  }
  // já traduzido (um nome montado com partes que já passaram por aqui)
  if (OUT[s]) return s;
  for (var i = 0; i < RULES.length; i++) {
    var m = RULES[i][0].exec(s);
    var r = m ? RULES[i][1](m) : null;
    if (r !== null) {
      OUT[r] = true;
      return r;
    }
  }
  // nome de variante escrito à mão: 'Tipo=Texto, Linha=Normal'
  if (/^[^=,]*[^=,\s]=[^=,\s][^=,]*(, [^=,]*[^=,\s]=[^=,\s][^=,]*)*$/.test(s)) {
    var pairs = s.split(', ').map(function (p) { var kv = p.split('='); return Lg(kv[0]) + '=' + LV(kv[0], kv[1]); }).join(', ');
    OUT[pairs] = true;
    return pairs;
  }
  if (s.indexOf(' · ') > 0) {
    var joined = s.split(' · ').map(function (part) { return L(part, global); }).join(' · ');
    OUT[joined] = true;
    return joined;
  }
  if (needsTranslation(s)) MISSING[s] = ORB.block || '—';
  return LANG === 'en' ? enNumbers(s) : s;
}
