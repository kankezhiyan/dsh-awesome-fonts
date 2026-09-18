/**
 * Post-install check: verify the profile really serves this plugin.
 *
 * Usage: `node test/install-check.mjs [profileDir]` (npm: `npm run test:install`).
 * The default profile is `$DSH_HOME/profiles/Test`. A profile that does not
 * exist is reported and skipped — the script is meant to run after
 * `dsh plugin --profile <name> add …`, not to fail on unrelated machines.
 *
 * It checks the three things an install can silently get wrong:
 *   1. resolution — `exports["./client"]`, `dsh.client.platform`, the bundle patch;
 *   2. composition — the package listed under `dsh.profile.bundles`, and the
 *      patch inserting exactly the loader row the client scan keys on;
 *   3. behaviour — the installed `client.js` emits the valid two-rule override.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadClientBundle, createContext } from './harness.mjs'

const PACKAGE_NAME = 'dsh-awesome-fonts'
const SELECTORS = [':root:root', 'html body']
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

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

const defaultProfile = process.env.DSH_HOME === undefined
  ? undefined
  : join(process.env.DSH_HOME, 'profiles', 'Test')
const profileDir = process.argv[2] ?? defaultProfile

if (profileDir === undefined || !existsSync(profileDir) || !statSync(profileDir).isDirectory()) {
  console.log(`install-check: no profile at ${String(profileDir)} — nothing to check (skipped)`)
  process.exit(0)
}

const require = createRequire(join(profileDir, 'package.json'))
let manifestPath
try {
  manifestPath = require.resolve(`${PACKAGE_NAME}/package.json`)
} catch (error) {
  console.log(`install-check: ${PACKAGE_NAME} is not installed in ${profileDir} — nothing to check (skipped)`)
  console.log(`               (install it first, e.g. dsh plugin --profile Test add "file:${repoRoot}")`)
  void error
  process.exit(0)
}

const packageDir = join(manifestPath, '..')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
console.log(`install-check: ${PACKAGE_NAME}@${manifest.version} at ${packageDir}`)

// 1. Resolution surface ------------------------------------------------------
check('exports["./client"] present', typeof manifest.exports?.['./client'] === 'string' || typeof manifest.exports?.['./client'] === 'object')
check('exports["."] present', manifest.exports?.['.'] !== undefined)
check('dsh.client.platform is "web"', manifest.dsh?.client?.platform === 'web')
check('dsh.bundle.patch present', typeof manifest.dsh?.bundle?.patch === 'string', JSON.stringify(manifest.dsh?.bundle))
const clientRel = typeof manifest.exports?.['./client'] === 'string'
  ? manifest.exports['./client']
  : manifest.exports?.['./client']?.default
const clientPath = join(packageDir, clientRel ?? 'client.js')
check('client bundle exists', existsSync(clientPath), clientPath)

// 2. Composition surface ----------------------------------------------------
const patchPath = join(packageDir, manifest.dsh?.bundle?.patch ?? 'cordis.patch.yml')
if (existsSync(patchPath)) {
  const patch = readFileSync(patchPath, 'utf8')
  check('patch inserts the package row', new RegExp(`name:\\s*['"]?${PACKAGE_NAME}['"]?`).test(patch), patch)
  check('patch row carries an id', /(^|\n)\s*-?\s*id:\s*\S+/.test(patch))
} else {
  check('bundle patch exists', false, patchPath)
}
const profileManifest = JSON.parse(readFileSync(join(profileDir, 'package.json'), 'utf8'))
const bundles = profileManifest.dsh?.profile?.bundles ?? []
if (bundles.includes(PACKAGE_NAME)) {
  passed += 1
} else {
  console.warn(
    `WARN  ${PACKAGE_NAME} is installed but missing from dsh.profile.bundles in ${join(profileDir, 'package.json')}\n` +
      '      → the bundle patch (and therefore the client bundle) is never composed; add it to that array.',
  )
}

// 3. Behaviour of the installed bundle --------------------------------------
const loaded = loadClientBundle(clientPath)
check('installed bundle id', loaded.id === PACKAGE_NAME, loaded.id)
const { context, captured } = createContext()
loaded.exports.apply(context)
const setUi = captured.props?.setUi
check('installed bundle exposes setUi', typeof setUi === 'function')
if (typeof setUi === 'function') {
  setUi('simsun')
  const css = loaded.document.getElementById('dsh-awesome-fonts-style')?.textContent ?? ''
  const selectors = css
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.slice(0, line.indexOf('{')).trim())
  check('installed bundle emits one rule per selector', selectors.join('|') === SELECTORS.join('|'), selectors.join('|'))
  check('installed bundle sets the UI variable', css.includes('--dsw-font-family: "SimSun"'))
  check('installed bundle carries !important', css.includes('!important'))
  check('installed bundle avoids the invalid body:body selector', !/body:body/.test(css), css)
}

// 4. Host half is importable -------------------------------------------------
const hostHref = pathToFileURL(join(packageDir, typeof manifest.exports?.['.'] === 'string' ? manifest.exports['.'] : 'index.js')).href
try {
  const host = await import(hostHref)
  check('host half exports apply()', typeof host.apply === 'function')
} catch (error) {
  check('host half imports', false, String(error?.message ?? error))
}

console.log(`install-check: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
