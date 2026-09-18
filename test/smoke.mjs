/**
 * dsh-awesome-fonts smoke test — the browser half's static + runtime contract.
 *
 * Run with `npm test` (or `node test/smoke.mjs`). No browser is needed: the
 * bundle is materialized through test/harness.mjs, `apply(ctx)` runs against a
 * fake page, and the injected stylesheet is asserted directly.
 *
 * The CSS assertions encode the v1.0.0 regression: the override was written as
 * `:root:root, body:body { … }`, and `body:body` is an INVALID selector in
 * Chromium (a type selector may appear only once in a compound selector). A
 * selector list is dropped in full when one entry is invalid, so the whole rule
 * never reached the cascade and no font ever changed. The fix emits one valid
 * rule per selector; the guards below fail loudly if that shape regresses.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createStorage, loadClientBundle, createContext } from './harness.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const clientPath = join(repoRoot, 'client.js')

let passed = 0
let failed = 0
function check(label, condition, detail) {
  if (condition) {
    passed += 1
    return
  }
  failed += 1
  console.error(`FAIL  ${label}${detail === undefined ? '' : ` — ${detail}`}`)
}
function equal(label, actual, expected) {
  check(label, Object.is(actual, expected), `expected ${String(expected)}, got ${String(actual)}`)
}

const STYLE_ID = 'dsh-awesome-fonts-style'
const UI_KEY = 'dsh-awesome-fonts:ui'
const CODE_KEY = 'dsh-awesome-fonts:code'
const SELECTORS = [':root:root', 'html body']
const GENERICS = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'])
/** A duplicated simple selector such as `body:body` (or `.a.a`) — invalid CSS. */
const DUPLICATED_SIMPLE = /(^|[\s,{])([A-Za-z][\w-]*):\2(?=[\s,{:])/
/** A duplicated type selector such as `bodybody` / `divdiv`. */
const DUPLICATED_TYPE = /(^|[\s,{])(body|html|div|span|p)\2(?=[\s,{.:[])/

/** Split `sel { decls }` rules (the bundle emits one rule per selector). */
function parseRules(css) {
  return css
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const match = /^(.*?)\s*\{(.*)\}\s*$/.exec(line)
      if (match === null) throw new Error(`unparsable rule: ${line}`)
      return { selector: match[1].trim(), declarations: match[2].trim() }
    })
}

function assertValidRuleShape(label, css) {
  check(`${label}: no duplicated simple selector`, !DUPLICATED_SIMPLE.test(css), css)
  check(`${label}: no duplicated type selector`, !DUPLICATED_TYPE.test(css), css)
  for (const rule of parseRules(css)) {
    check(
      `${label}: selector "${rule.selector}" is an allowed form`,
      SELECTORS.includes(rule.selector),
      rule.selector,
    )
  }
}

// ---------------------------------------------------------------------------
// 1. Bundle contract
// ---------------------------------------------------------------------------
const first = loadClientBundle(clientPath)
equal('bundle id', first.id, 'dsh-awesome-fonts')
check('exports apply()', typeof first.exports.apply === 'function')
check(
  'exports inject slots + locale',
  Array.isArray(first.exports.inject) &&
    first.exports.inject.length === 2 &&
    first.exports.inject.includes('slots') &&
    first.exports.inject.includes('locale'),
  JSON.stringify(first.exports.inject),
)

const source = readFileSync(clientPath, 'utf8')
check('source carries the v1.0.1 selector pair', source.includes('OVERRIDE_SELECTORS'))
check('source emits one rule per selector', source.includes('.map((selector) =>'))

// ---------------------------------------------------------------------------
// 2. Catalogs
// ---------------------------------------------------------------------------
const { UI_FONTS, CODE_FONTS, DEFAULT_FONT } = first.exports
equal('UI catalog size', UI_FONTS.length, 99)
equal('code catalog size', CODE_FONTS.length, 31)
equal('UI default first', UI_FONTS[0].id, DEFAULT_FONT)
equal('code default first', CODE_FONTS[0].id, DEFAULT_FONT)

for (const [name, catalog] of [['UI', UI_FONTS], ['code', CODE_FONTS]]) {
  const ids = new Set()
  for (const font of catalog) {
    check(`${name} id "${font.id}" unique`, !ids.has(font.id))
    ids.add(font.id)
    check(`${name} "${font.id}" has a label`, typeof font.label === 'string' && font.label !== '')
    if (font.id === DEFAULT_FONT) {
      equal(`${name} default stack is null`, font.stack, null)
      continue
    }
    check(`${name} "${font.id}" has a stack`, typeof font.stack === 'string' && font.stack.length > 0)
    const families = font.stack.split(',').map((part) => part.trim().toLowerCase())
    check(`${name} "${font.id}" ends in a generic family`, GENERICS.has(families[families.length - 1]), font.stack)
  }
  // UI entries carry an optgroup key; every key must be translated.
  if (name === 'UI') {
    for (const font of catalog) {
      if (font.id === DEFAULT_FONT) continue
      check(`UI "${font.id}" has a group`, typeof font.group === 'string' && font.group !== '')
    }
  }
}

// ---------------------------------------------------------------------------
// 3. i18n dictionaries
// ---------------------------------------------------------------------------
const { context, captured } = createContext()
first.exports.apply(context)
const dictionary = captured.dictionary?.dictionary ?? {}
const zhKeys = Object.keys(dictionary.zh ?? {}).sort()
const enKeys = Object.keys(dictionary.en ?? {}).sort()
equal('zh/en key sets match', zhKeys.join('|'), enKeys.join('|'))
check('nav + title copy present', zhKeys.includes('font.nav') && zhKeys.includes('font.title'))
for (const group of new Set(UI_FONTS.filter((f) => f.id !== DEFAULT_FONT).map((f) => f.group))) {
  check(`group copy "${group}" in zh`, Object.prototype.hasOwnProperty.call(dictionary.zh ?? {}, `font.group.${group}`))
  check(`group copy "${group}" in en`, Object.prototype.hasOwnProperty.call(dictionary.en ?? {}, `font.group.${group}`))
}

// ---------------------------------------------------------------------------
// 4. Section registration + store wiring
// ---------------------------------------------------------------------------
const section = captured.section
check('registers settings.section', section !== null && section.config.name === 'settings.section')
equal('section id', section?.config.id, 'dsh-awesome-fonts')
equal('section order', section?.config.order, 50)
equal('section locale namespace', section?.config.locale, 'settings.font')
check('section has a store handle', typeof section?.config.store?.create === 'function')
check('section label thunk is localized', section?.config.label?.() === 'Fonts' || section?.config.label?.() === '全局字体', String(section?.config.label?.()))
check('inject() exposes setUi/setCode', typeof captured.props?.setUi === 'function' && typeof captured.props?.setCode === 'function')
check('store mirrored the initial revision', captured.syncCalls.length >= 1)

// ---------------------------------------------------------------------------
// 5. Style application (no saved preference → zero impact)
// ---------------------------------------------------------------------------
const styleEl = first.document.getElementById(STYLE_ID)
check('style element injected', styleEl !== null)
equal('style element is tagged for HMR', styleEl?.dataset.pluginCss, 'dsh-awesome-fonts/style')
equal('no saved preference → empty override', styleEl?.textContent, '')

// ---------------------------------------------------------------------------
// 6. Choosing a UI font
// ---------------------------------------------------------------------------
captured.props.setUi('simsun')
let css = first.document.getElementById(STYLE_ID).textContent
let rules = parseRules(css)
equal('one rule per selector', rules.length, SELECTORS.length)
equal('selectors', rules.map((r) => r.selector).join('|'), SELECTORS.join('|'))
for (const rule of rules) {
  check(
    `rule ${rule.selector} declares the UI font`,
    rule.declarations.includes('--dsw-font-family: "SimSun", "NSimSun", "Times New Roman", serif !important;'),
    rule.declarations,
  )
  check(`rule ${rule.selector} keeps declarations important`, rule.declarations.includes('!important'))
}
assertValidRuleShape('setUi(simsun)', css)
equal('UI preference persisted', first.storage.getItem(UI_KEY), 'simsun')

// ---------------------------------------------------------------------------
// 7. Choosing a code font
// ---------------------------------------------------------------------------
captured.props.setCode('fira')
css = first.document.getElementById(STYLE_ID).textContent
rules = parseRules(css)
equal('still one rule per selector', rules.length, SELECTORS.length)
for (const rule of rules) {
  check(
    `rule ${rule.selector} declares the code font`,
    rule.declarations.includes('--ds-font-family-code: "Fira Code", Consolas, "SF Mono", monospace !important;'),
    rule.declarations,
  )
  check(`rule ${rule.selector} keeps the UI font`, rule.declarations.includes('--dsw-font-family:'))
}
equal('code preference persisted', first.storage.getItem(CODE_KEY), 'fira')

// ---------------------------------------------------------------------------
// 8. Unknown ids fall back to "default" and clear their storage key
// ---------------------------------------------------------------------------
captured.props.setUi('not-a-real-font')
css = first.document.getElementById(STYLE_ID).textContent
check('unknown UI id drops the UI override', !css.includes('--dsw-font-family'))
check('code override survives an unknown UI id', css.includes('--ds-font-family-code'))
equal('unknown UI id clears storage', first.storage.getItem(UI_KEY), null)
captured.props.setCode('nope')
equal('both defaults → empty override', first.document.getElementById(STYLE_ID).textContent, '')
equal('unknown code id clears storage', first.storage.getItem(CODE_KEY), null)

// ---------------------------------------------------------------------------
// 9. Restored preference at load (before any interaction)
// ---------------------------------------------------------------------------
const restored = loadClientBundle(clientPath, {
  storage: createStorage({ [UI_KEY]: 'lxgw', [CODE_KEY]: 'consolas' }),
})
const restoredCtx = createContext()
restored.exports.apply(restoredCtx.context)
const restoredCss = restored.document.getElementById(STYLE_ID).textContent
assertValidRuleShape('restored', restoredCss)
check('restored UI font applied at load', restoredCss.includes('--dsw-font-family: "LXGW WenKai"'))
check('restored code font applied at load', restoredCss.includes('--ds-font-family-code: "Consolas"'))
equal('restored UI select value', restoredCtx.captured.syncCalls.at(-1)?.[0], 'lxgw')
equal('restored code select value', restoredCtx.captured.syncCalls.at(-1)?.[1], 'consolas')

// ---------------------------------------------------------------------------
// 10. Unload removes the injected style
// ---------------------------------------------------------------------------
for (const { disposer } of captured.disposers) {
  if (typeof disposer === 'function') disposer()
}
equal('teardown removes the style element', first.document.getElementById(STYLE_ID), null)

// ---------------------------------------------------------------------------
console.log(`smoke: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
