# Repository Guidelines

## Project Structure & Module Organization

This is a zero-build, bilingual static portfolio. `index.html` contains the application markup, Tailwind-based styling, inline SVG sprite, and vanilla JavaScript, including the `I18N` dictionary. Keep its `data-i18n`, `data-project`, `data-credential`, and related selectors stable because verification relies on them. Static images and published documents live in `assets/`; agent-discovery metadata lives in `.well-known/`. Development utilities are the root-level `serve.mjs`, `screenshot.mjs`, and `verify.mjs`. Hook tests live in `test/`, deployment configuration in `wrangler.toml`, and generated deployment output in ignored `public/`.

## Build, Test, and Development Commands

- `npm install` installs Puppeteer for browser checks and screenshots.
- `npm start` serves the repository at `http://localhost:3000`.
- `npm run verify:static` syntax-checks all development `.mjs` scripts.
- `npm run test:hooks` runs the Git-hook tests with Node's test runner.
- `node verify.mjs http://localhost:3000` runs browser acceptance checks against a running server.
- `npm run screenshot -- http://localhost:3000 portfolio` captures reference images.
- `npm run build:pages` assembles the Cloudflare deployment into `public/`.
- `npm run hooks:install` activates the versioned hooks in `.githooks/`.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and single quotes in JavaScript. Prefer `camelCase` for functions and variables, `UPPER_SNAKE_CASE` for constants such as `I18N`, and kebab-case for HTML IDs and data-attribute values. Preserve accessible controls, descriptive image `alt` text, safe external links (`target="_blank"` with `rel="noopener"`), bilingual PT-BR/EN content, and reduced-motion behavior. Avoid runtime icon dependencies; icons must reference the inline SVG sprite.

## CSP Inline Script Hash

`index.html` contains an inline `<script>` block with the `I18N` dictionary. Its SHA-256 hash is hardcoded in **two places** that must always be kept in sync:

- `_headers` — `script-src` directive (served by Cloudflare)
- `worker.js` — same CSP header injected by the Worker

**Any edit to that inline script invalidates the hash.** After touching it, regenerate:

```bash
node -e "
const fs = require('fs'), crypto = require('crypto');
const html = fs.readFileSync('index.html','utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const hash = crypto.createHash('sha256').update(m[1]).digest('base64');
console.log('sha256-' + hash);
"
```

Then update both `_headers` and `worker.js` with the new hash. The `test:security` suite validates that both files agree.

## Testing Guidelines

Write hook tests as `test/*.test.mjs` using `node:test` and `node:assert/strict`. There is no numeric coverage target. For content or UI changes, run static checks and the browser suite; inspect desktop and mobile screenshots when layout changes. Treat `verify.mjs` assertions as acceptance requirements.

## Intelligence Tools

Use these in preference order — faster and cheaper than raw file reads.

**RTK** — prefix all shell commands:
```bash
rtk git status | rtk git diff | rtk grep -n "pattern" file | rtk find . -name "*.mjs"
```

**CodeGraph** — `.codegraph/` is indexed; reach for it before grep or file reads:
- MCP: `codegraph_explore` returns verbatim source + call graph in one call
- Shell: `codegraph explore "<symbol or question>"`

**graphify** — `graphify-out/graph.json` is built; use for architecture and navigation questions:
```bash
graphify query "<question>"
```
Rebuild with `/graphify .` after significant file additions.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style subjects, for example `feat(agent-readiness): add discovery files` or `fix(webmcp): align agent-facing facts`. Use an imperative, concise subject with a relevant scope. Pull requests should explain the user-visible change, list verification performed, link related issues or plans, and include before/after screenshots for visual changes. Do not commit generated `public/`, temporary screenshots, unrelated binaries, secrets, or local-only personal files.
