/**
 * Shared test harness for the dsh-awesome-fonts browser half.
 *
 * The client bundle is a `window.__ModuleLoader__.load({ id, factory })` CJS
 * wrapper, so it only needs three things from a page: a `window` with
 * `localStorage`, a `document` with `head` / `createElement` / `getElementById`,
 * and the shell's frozen `require` targets. This harness provides exactly those
 * — no jsdom, no browser — so `apply(ctx)` can be executed in plain Node and
 * the injected CSS inspected directly.
 *
 * The selector contract this harness guards was verified against real Chromium
 * (headless): `document.querySelectorAll('body:body')` throws "not a valid
 * selector" and drops the whole rule it appears in, while `:root:root` and
 * `html body` both parse and apply.
 */
import { readFileSync } from 'node:fs'
import { webcrypto } from 'node:crypto'

/** localStorage double: a Map behind the three methods the bundle uses. */
export function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    /** Test-only view. */
    snapshot: () => Object.fromEntries(map),
  }
}

/** One fake element with the surface the bundle touches. */
function createElement(tagName, document) {
  const el = {
    tagName: String(tagName).toUpperCase(),
    id: '',
    dataset: {},
    textContent: '',
    parentNode: null,
    children: [],
    style: {},
    remove() {
      if (el.parentNode === null) return
      const index = el.parentNode.children.indexOf(el)
      if (index >= 0) el.parentNode.children.splice(index, 1)
      el.parentNode = null
    },
  }
  void document
  return el
}

/** Minimal document: a head that keeps insertion order plus id lookup. */
export function createDocument() {
  const document = {
    head: {
      children: [],
      appendChild(el) {
        el.parentNode = document.head
        document.head.children.push(el)
        return el
      },
      insertBefore(el, before) {
        el.parentNode = document.head
        const index = document.head.children.indexOf(before)
        if (index < 0) document.head.children.push(el)
        else document.head.children.splice(index, 0, el)
        return el
      },
      removeChild(el) {
        el.remove()
        return el
      },
    },
    body: null,
    documentElement: null,
    createElement: (tagName) => createElement(tagName, document),
    getElementById(id) {
      return document.head.children.find((el) => el.id === id) ?? null
    },
    querySelector(selector) {
      void selector
      return null
    },
  }
  document.body = createElement('body', document)
  document.documentElement = createElement('html', document)
  return document
}

/** The shell's frozen module table, narrowed to what this bundle requires. */
function createRequire() {
  const jsxRuntime = {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
    Fragment: Symbol.for('react.fragment'),
  }
  const react = { createElement: (type, props, ...children) => ({ type, props, children }) }
  const clientStore = {
    defineStore: (decl) => ({
      spec: decl,
      create: () => ({
        actions: {},
        getSnapshot: () => decl.init(),
        subscribe: () => () => {},
        store: {},
        clearPersisted: () => {},
      }),
    }),
  }
  const table = {
    react,
    'react/jsx-runtime': jsxRuntime,
    '@deepseek-ai/dsh-client-store': clientStore,
  }
  const require = (spec) => {
    if (!Object.prototype.hasOwnProperty.call(table, spec)) {
      throw new Error(`client-modules: require("${spec}") missed the module table`)
    }
    return table[spec]
  }
  return require
}

/**
 * Materialize the browser half of the plugin.
 *
 * @param clientPath - Absolute path of the `client.js` bundle to load.
 * @param options - `storage` seeds localStorage; `document` reuses a document.
 * @returns the bundle exports plus the fake page it was loaded into.
 */
export function loadClientBundle(clientPath, options = {}) {
  const source = readFileSync(clientPath, 'utf8')
  const document = options.document ?? createDocument()
  const storage = options.storage ?? createStorage()
  const registrations = []
  const window = {
    localStorage: storage,
    __ModuleLoader__: {
      load: (registration) => {
        registrations.push(registration)
      },
    },
  }
  // The bundle's own scope provides `window` / `document`, so nothing leaks
  // into the Node globals (the bundle is not ESM and cannot be imported).
  const run = new Function('window', 'document', 'requestAnimationFrame', 'queueMicrotask', source)
  run(window, document, (callback) => setTimeout(callback, 0), queueMicrotask)
  if (registrations.length !== 1) {
    throw new Error(`expected exactly one bundle registration, saw ${registrations.length}`)
  }
  const registration = registrations[0]
  const exports = registration.factory(createRequire())
  void webcrypto
  return { id: registration.id, exports, document, storage }
}

/**
 * Stand-in for the client cordis context: records effects, dictionaries and
 * slot registrations, and drives the section's `inject(actions)` face exactly
 * like the shell does (props = standardKit + the inject result).
 *
 * @returns the fake context plus the captured section registration.
 */
export function createContext() {
  /** @type {{ section: any, props: any, actions: any, dictionary: any, disposers: any[], syncCalls: any[][] }} */
  const captured = {
    section: null,
    props: null,
    actions: null,
    dictionary: null,
    disposers: [],
    syncCalls: [],
  }
  const context = {
    effect(body, label) {
      const disposer = body()
      captured.disposers.push({ label, disposer })
      return disposer
    },
    locale: {
      register(namespace, dictionary) {
        captured.dictionary = { namespace, dictionary }
        return () => {
          captured.dictionary = null
        }
      },
      bind(namespace) {
        return (key) => {
          const dictionaries = captured.dictionary?.dictionary ?? {}
          return dictionaries.zh?.[key] ?? dictionaries.en?.[key] ?? `${namespace}:${key}`
        }
      },
    },
    slots: {
      inject(name, callback) {
        if (name !== 'settings.section') throw new Error(`unexpected slot injection: ${name}`)
        return callback()
      },
      register(config, component) {
        captured.section = { config, component }
        const actions = {
          sync: (...args) => {
            captured.syncCalls.push(args)
          },
        }
        captured.actions = actions
        captured.props = config.inject?.(actions) ?? null
        return { config, component }
      },
    },
    get() {
      return undefined
    },
    on() {
      return () => {}
    },
  }
  return { context, captured }
}
