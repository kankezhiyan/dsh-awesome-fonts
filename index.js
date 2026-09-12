/**
 * dsh-awesome-fonts — host half.
 *
 * The host side is intentionally a no-op loader entry: the whole feature
 * lives in the browser half (`./client`), which DSH's dsh-client-modules
 * picks up through the package's `dsh.client` declaration — the same shape
 * as the shipped client-only packages of the current DSH generation
 * (platform: "web", immediate activation). `cordis.patch.yml` inserts the
 * loader row ({ id: dsh-awesome-fonts, name: 'dsh-awesome-fonts' }) into the
 * hosting profile's composition, exactly like the rows the base bundles
 * contribute.
 *
 * The section's dictionaries are registered with the client `locale` service
 * (provided by @deepseek-ai/dsh-client-locale) and its section store comes
 * from @deepseek-ai/dsh-client-store's `defineStore`; no host services are
 * used. The font choice is persisted in localStorage, because the Host
 * settings wire only exposes an allowlisted set of namespaces to browser
 * clients, so a third-party namespace would answer `settings-not-exposed`.
 */

/** Host loader entry for the browser implementation exported from `./client`. */
export function apply() {}
