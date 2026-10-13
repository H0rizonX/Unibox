# Project Memory

## Dev Workflow
- `pnpm dev` opens 3 separate mintty (Git Bash) terminal windows for main/admin/server apps
- Script: `scripts/dev.mjs` - auto-detects mintty, falls back to cmd.exe
- Alternative: `pnpm dev:concurrent` (single terminal with prefixes), `pnpm dev:turbo` (original turbo)
- mintty location: `D:\WorkBuddyAI\resources\vendor\PortableGit\usr\bin\mintty.exe`

## Lint Setup
- **All three apps now use Biome** (migrated from ESLint+Prettier)
- `apps/main`: Biome (double quotes, semicolons always, lineWidth 100)
- `apps/admin`: Biome (single quotes, no semicolons, lineWidth 80) — a11y rules downgraded to warn during migration
- `apps/server`: Biome (single quotes, no semicolons, lineWidth 80)
- Root `.gitattributes` enforces LF for all text files (prevents CRLF issues on Windows)
- `core.autocrlf = true` in git config, overridden by `.gitattributes`
- VS Code configured with Biome extension as default formatter

## Monorepo Structure
- Turborepo + pnpm workspaces
- 3 apps: main (Next.js 16), admin (Vite + React), server (Express + tsx watch)
- Packages in `packages/*` (shared)
