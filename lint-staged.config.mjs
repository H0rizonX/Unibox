/**
 * lint-staged configuration for the Unibox monorepo.
 *
 * Each app has its own biome.json with different formatting rules.
 * We use `pnpm --filter <pkg> exec biome --staged` so that:
 * - pnpm handles the directory change (no `cd` needed, cross-shell safe)
 * - Biome's `--staged` discovers staged files via git and respects the
 *   per-app config scope (files outside the config dir are skipped)
 *
 * Function tasks are used so lint-staged only triggers the command when
 * matching files are staged. lint-staged then handles auto-restaging
 * of any files that Biome modified with --write.
 */
const biomeStaged = (pkgName) => () =>
  `pnpm --filter ${pkgName} exec biome check --staged --write --no-errors-on-unmatched`;

export default {
  "apps/main/**/*.{ts,tsx,js,jsx,mjs,cjs,json,css}": biomeStaged("@unibox/main"),
  "apps/server/**/*.{ts,tsx,js,jsx,mjs,cjs,json}": biomeStaged("@unibox/server"),
  "apps/admin/**/*.{ts,tsx,js,jsx,mjs,cjs,json,css}": biomeStaged("@unibox/admin"),
};
