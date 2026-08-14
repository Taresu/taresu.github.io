# Design: Employer Logos in Experience Section

## Summary

Add employer logos to each experience card in the `#experiencia` section. Logos appear as absolutely-positioned images in the top-right corner of each article, inside a styled pill container.

## Logo Mapping

| Experience entry | Logo file | Pill style |
|---|---|---|
| Desenvolvedor Full Stack · UTFPR | `assets/utfpr1.png` | light (white) |
| DevOps Intern · Câmara Municipal de Curitiba | `assets/camara-curitiba.png` | light (white) |
| Desenvolvedor Web · UTFPR | `assets/utfpr1.png` | light (white) |
| Coordenador Voluntário · VESPAS | `assets/VESPAS.Logo1.png` | dark (navy) |
| Estágio em Segurança da Informação · Volkswagen | `assets/Volkswagen_logo_2019.svg` | light (white) |

## HTML Changes

Each `<article>` in `#experiencia` receives one new `<img>` tag as its first child:

```html
<img src="assets/utfpr1.png" alt="UTFPR"
     class="employer-logo" data-logo-bg="light">
```

- `class="employer-logo"` — styled by the new CSS rules
- `data-logo-bg="light"` — white pill; VESPAS uses `"dark"` instead
- `alt` — employer name for accessibility
- No other HTML structure changes

## CSS Changes

Two rules added to the site's `<style>` block:

```css
.employer-logo {
  position: absolute;
  top: 0;
  right: 0;
  width: 52px;
  height: 52px;
  object-fit: contain;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.employer-logo[data-logo-bg="light"] { background: #fff; }
.employer-logo[data-logo-bg="dark"]  { background: #0f1523; border: 1px solid #2d3550; }
```

Each `<article>` must have `position: relative` set — verify existing styles and add inline if missing.

## What Does Not Change

- All existing article markup, bullet points, chips, and i18n keys remain untouched
- `verify.mjs` assertions are unaffected — none query `<img>` elements inside experience articles
- No JS changes required
- No new dependencies

## Rationale

- **Top-right corner**: industry-standard résumé placement; recognizable at a glance
- **White pill**: guarantees dark-colored logos (VW, UTFPR, Câmara) remain legible on the dark card background
- **Dark pill for VESPAS**: the VESPAS logo is near-white; a dark navy background matches its brand and makes it visible
- **Direct `<img>` tags**: consistent with the rest of `index.html`'s no-JS, no-build approach; no flash-before-paint risk
