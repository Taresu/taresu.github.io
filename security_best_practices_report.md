# Security Best-Practices Audit

**Project:** Personal Portfolio (`thales-salata.dev`)
**Audit date:** 2026-08-25
**Scope:** Deployed static portfolio, browser JavaScript, Cloudflare Worker and static-asset configuration, local development server, dependency/deployment commands, and Git hooks.

## Executive summary

The deployed portfolio has a small attack surface: it has no authentication, backend data store, user-generated content, or browser-side secrets, and its main JavaScript dependency is self-hosted. The audit confirmed one high-severity development-time file-disclosure vulnerability, one medium-severity production hardening gap, and two low-severity supply-chain/privacy issues. SEC-001 was remediated on 2026-08-25. SEC-002 is implemented in the repository and awaits deployment verification; SEC-003 and SEC-004 remain open.

The most urgent operational step is deploying and verifying SEC-002's Content Security Policy and related response headers on the live Cloudflare responses.

| ID | Severity | Finding | Priority |
| --- | --- | --- | --- |
| SEC-001 | High | Local development server permits arbitrary file disclosure | Remediated |
| SEC-002 | Medium | Production responses lack browser security headers | Deploy pending |
| SEC-003 | Low | Google Fonts stylesheet is an unpinned third-party runtime dependency | Planned hardening |
| SEC-004 | Low | Deployment dependencies and tooling are not reproducibly pinned | Planned hardening |

No critical findings were identified.

## High severity

### SEC-001: Local development server permits arbitrary file disclosure

**Rule ID:** SEC-001 / CWE-22 (Path Traversal)
**Severity:** High
**Original location:** `serve.mjs` request routing and listener (pre-remediation)
**Status:** Remediated on 2026-08-25

**Evidence**

The request path is taken directly from `req.url`, joined to the repository directory, and passed to `fs.readFile` without canonicalization, web-root containment, or a dotfile deny rule:

```js
const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  // ...
  const filePath = path.join(__dirname, urlPath);
  // ...
  fs.readFile(filePath, (err, data) => {
```

The server also omits the `host` argument:

```js
server.listen(PORT, () => {
```

That makes the development service reachable on available network interfaces rather than explicitly limiting it to loopback.

A local, status-only reproduction against port 3001 returned:

```text
/index.html                              200
/.git/config                             200
/../WebDev-Portfolio/package.json        200
```

No disclosed file contents were retained in this report.

**Impact**

Anyone who can reach the development server can retrieve repository metadata and files in sibling or parent directories readable by the Node process. Depending on the workstation, this could expose source code, remote repository URLs, local configuration, credentials, or other private material. This is rated High because it crosses the intended filesystem boundary and the server is not restricted to loopback; it is not Critical because this server is development tooling and is not the production Cloudflare serving path.

**Fix**

1. Bind the server explicitly to `127.0.0.1` by default, with any network-accessible override requiring an explicit environment setting.
2. Serve only the generated/public asset directory or an explicit allowlist of published paths.
3. Parse the request URL, resolve the candidate path against the web root, and reject it unless its canonical path remains inside that root.
4. Reject dotfile path segments and non-`GET`/`HEAD` methods.
5. Add regression tests for literal and percent-encoded traversal, mixed separators where applicable, dotfiles, sibling paths, query strings, and valid assets.

**Mitigation**

Until fixed, use the development server only on a trusted machine, keep it bound behind a local-only boundary, and do not expose the port through a tunnel, container port publication, shared LAN, or remote development environment.

**False-positive notes**

This is confirmed, not inferred: both repository dotfile access and a parent-directory request returned HTTP 200 during the audit.

**Remediation verification**

`serve.mjs:9-17` now defaults to loopback and defines the public allowlist, `serve.mjs:46-69` normalizes and lexically contains requested paths, `serve.mjs:72-97` restricts methods and enforces canonical containment, and `serve.mjs:139-140` binds the configured host explicitly. `test/server-security.test.mjs:66-130` verifies literal and encoded traversal, dotfiles, non-public root files, unsupported methods, non-loopback reachability, and symlink escape attempts. The four integration tests pass through `npm run test:security`.

## Medium severity

### SEC-002: Production responses lack browser security headers

**Rule ID:** SEC-002 / JS-CSP-001 / JS-CSP-002
**Severity:** Medium
**Original location:** `_headers` and `worker.js` response paths (pre-remediation)
**Status:** Implemented in the repository on 2026-08-25; production deployment verification pending

**Evidence**

The static header configuration adds only discovery and content-negotiation headers:

```text
/
  Link: ...
  Vary: Accept

/index.html
  Link: ...
  Vary: Accept
```

The Worker-created Markdown response similarly sets only content type, cache, and negotiation headers, while the normal HTML path returns the asset response unchanged:

```js
headers: {
  'Content-Type': 'text/markdown; charset=utf-8',
  'Vary': 'Accept',
  'Cache-Control': 'public, max-age=3600',
},
// ...
return env.ASSETS.fetch(request);
```

Fresh runtime checks of `https://thales-salata.dev/` for both `text/html` and `text/markdown` confirmed that the responses do not include:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- clickjacking protection through CSP `frame-ancestors` or `X-Frame-Options`

The route configuration runs the Worker first for `/` and `/index.html` (`wrangler.toml:10-13`). Cloudflare documents that `_headers` rules do not apply to responses generated by Worker code, so the homepage Worker path and directly served asset paths must both be accounted for: [Cloudflare Workers static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/).

The page also contains several inline script blocks (`index.html:19-58`, `index.html:65`, `index.html:1763`, `index.html:2429`, and `index.html:2886`). A useful CSP must therefore use reviewed hashes/nonces or move executable code to same-origin files; adding `script-src 'unsafe-inline'` would materially weaken the protection.

**Impact**

The site lacks defense in depth against script injection, clickjacking, MIME confusion, unnecessary browser capabilities, and referrer leakage. The portfolio does not currently render user-generated HTML, so no direct XSS exploit was identified and the issue is rated Medium rather than High.

**Fix**

1. Define a reviewed security-header policy and apply it in `worker.js` to both the HTML asset response and Worker-created Markdown response while preserving the original body, status, cache metadata, and content negotiation.
2. Add the corresponding headers to `_headers` for paths served directly by Cloudflare's static asset layer.
3. Inventory executable inline scripts and authorize their exact hashes so CSP can be enforced without `unsafe-eval` or `script-src 'unsafe-inline'`; validate the enforced policy in a real browser before deployment.
4. Include at minimum a restrictive `script-src`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and resource directives limited to the origins actually used by the portfolio.
5. Add `X-Content-Type-Options: nosniff`, a privacy-preserving `Referrer-Policy`, and a minimal `Permissions-Policy` disabling unused capabilities.
6. Add automated response-header checks for HTML, Markdown negotiation, and a directly served static asset.

**Mitigation**

The existing absence of dynamic untrusted content, use of `textContent` for translated strings, and self-hosted Tailwind runtime reduce current exploitability but do not replace response-level protections.

**False-positive notes**

This finding was verified against live production responses, not based solely on repository configuration. Headers injected by another edge layer were not present at audit time.

**Remediation verification**

`worker.js:1-24` defines the shared CSP and hardening headers, while `worker.js:26-69` streams the original asset body and preserves response status, cache metadata, validators, and `Vary` semantics. `_headers:4-9` applies the same policy to directly served static assets. The CSP authorizes the four current executable inline scripts by SHA-256 hash, forbids inline event-handler scripts and `unsafe-eval`, restricts frames and browser capabilities, and permits only the current same-origin assets plus Google Fonts. CSS retains `'unsafe-inline'` because the page and Tailwind runtime currently generate inline styles; this does not authorize inline JavaScript.

`test/security-headers.test.mjs:130-171` checks HTML, negotiated Markdown, response metadata preservation, required CSP directives, exact inline-script hashes, and Worker/static-policy parity. A real Chromium session loaded the Worker-equivalent response with zero console errors; interactive terminal content and page controls rendered successfully. The remaining Tailwind Play CDN warning predates this remediation and is unrelated to CSP. Live production headers must be rechecked after deployment before the finding is marked fully remediated.

## Low severity

### SEC-003: Google Fonts is an unpinned third-party runtime dependency

**Rule ID:** SEC-003 / JS-SUPPLY-001 / JS-SRI-001
**Severity:** Low
**Location:** `index.html:60-62`

**Evidence**

The page connects to Google and loads a cross-origin stylesheet without Subresource Integrity:

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet"/>
```

The executable Tailwind dependency is already self-hosted at `index.html:63-64`, which is a positive control. The remaining remote stylesheet is the only identified third-party runtime code/style dependency.

**Impact**

Every first visit discloses network metadata to a third party and depends on remotely supplied CSS. A provider or delivery-chain compromise could alter the stylesheet, and an outage or blocking policy can affect typography and rendering. The risk is Low because the resource is CSS from a well-known provider and no sensitive application data is present.

**Fix**

Self-host the exact WOFF2 files and corresponding `@font-face` declarations under `assets/`, use `font-display: swap`, and remove the Google preconnect and stylesheet requests. Self-hosting is preferable to SRI here because the Google Fonts CSS response can vary and is not exposed as a stable, versioned artifact suitable for a fixed integrity hash.

**Mitigation**

If remote fonts remain, restrict CSP `style-src` and `font-src` to the exact Google origins, retain local fallback fonts, and document the privacy and availability tradeoff.

**False-positive notes**

This is a hardening and privacy finding, not evidence that the current Google-hosted resource is malicious.

### SEC-004: Deployment dependencies and tooling are not reproducibly pinned

**Rule ID:** SEC-004 / software supply-chain hardening
**Severity:** Low
**Location:** `package.json:13`, `package.json:18-20`, repository root (no `package-lock.json`)

**Evidence**

The deployment command downloads and executes the then-current Wrangler release:

```json
"deploy:cloudflare": "npx wrangler@latest deploy"
```

Puppeteer uses a version range, and the repository has no lockfile:

```json
"dependencies": {
  "puppeteer": "^24.40.0"
}
```

As a result, clean installs and deployments can resolve to code that was not represented in the reviewed commit. The local audit environment also reported Puppeteer as an unmet dependency, so dependency vulnerability metadata could not be evaluated from an installed, locked tree.

**Impact**

A newly published, compromised, or unexpectedly incompatible package can run during installation or deployment, potentially with access to developer or CI credentials. The issue is rated Low because exploitation depends on an upstream event or unsafe release rather than direct remote input to the portfolio.

**Fix**

1. Add Wrangler as a pinned development dependency and invoke the local binary through the npm script.
2. Generate and commit `package-lock.json`, use `npm ci` in CI, and review dependency updates explicitly.
3. Move Puppeteer to `devDependencies` because it is development/test tooling rather than runtime application code.
4. Add dependency auditing and update review to CI without allowing audit output to rewrite the lockfile automatically.

**Mitigation**

Until pinned, inspect the resolved Wrangler version before deployment and run deployments only from a trusted, isolated environment with narrowly scoped Cloudflare credentials.

**False-positive notes**

Version ranges alone are normal npm practice when accompanied by a committed lockfile. The finding is based on the combination of an absent lockfile and explicit `@latest` execution in the deployment path.

## Reviewed non-findings and positive controls

- **DOM injection:** The three `innerHTML` assignments at `index.html:2356`, `index.html:2358`, and `index.html:2392` receive fixed literals. Terminal text and translations flow through `textContent` at `index.html:1926-1929` and `index.html:2361-2382`; no attacker-controlled source reaches an HTML parsing sink.
- **Dynamic code and messaging:** No application use of `eval`, `new Function`, string-based timers, `document.write`, `insertAdjacentHTML`, `postMessage`, or string event-handler attributes was identified. The `$eval` occurrence in `verify.mjs` is a Puppeteer page-query API, not JavaScript string evaluation.
- **Browser storage:** `localStorage` contains only language and ambient-audio preferences. Language is restricted to `pt` or `en` at `index.html:1961-1973`, and volume is parsed, checked for finiteness, and bounded to 0–1 at `index.html:2026-2035`. No authentication tokens or secrets are stored.
- **External links:** Reviewed links using `target="_blank"` include `rel="noopener"` or `rel="noopener noreferrer"`.
- **Runtime JavaScript supply chain:** Tailwind 3.4.16 is served from `assets/vendor/` rather than executed from a third-party CDN (`index.html:63-64`).
- **Deployment allowlist:** `.assetsignore` starts with `*` and explicitly permits only published HTML/Markdown, discovery files, and `assets/**`. Repository metadata, development scripts, configuration, and this report are excluded from the Worker static-asset deployment.
- **Secrets:** A repository-wide pattern scan excluding binary PDFs and vendored JavaScript found no obvious private keys, common cloud access-key formats, GitHub tokens, OpenAI-style keys, or assigned Cloudflare API tokens. This heuristic scan does not replace a dedicated secret-scanning service or history scan.
- **Published documents:** CVs, the English résumé, and academic documents are linked by the portfolio and included in the deployment allowlist; they are treated as intentionally public content.
- **Git hooks:** The versioned pre-commit hook runs `git diff --cached --check`, and the pre-push hook runs static JavaScript syntax checks. Neither hook handles credentials or downloads executable code.

## Recommended remediation order

1. **SEC-001 — completed:** the development server now enforces a public-path boundary, rejects non-read methods, defaults to loopback, and has regression coverage.
2. **SEC-002 — deployment pending:** deploy the implemented Worker/static security headers and verify HTML, Markdown, and direct-asset responses on the live domain.
3. **SEC-004:** pin deployment tooling and commit a lockfile before relying on automated dependency vulnerability checks.
4. **SEC-003:** self-host fonts when optimizing privacy, availability, and CSP simplicity.

## Method and limitations

The audit combined source review, high-signal security-pattern searches, deployment allowlist/configuration review, status-only local exploit reproduction, and live production response-header inspection. The browser guidance was evaluated against OWASP, MDN, and the project's JavaScript security reference; Cloudflare response behavior was checked against the official Workers static-assets documentation.

This was a focused code/configuration audit, not a penetration test. It did not inspect Cloudflare account settings, DNS controls, access-token scopes, Git history, dependency advisories without a lockfile/install, third-party account security, or the contents and metadata of intentionally published PDFs.
