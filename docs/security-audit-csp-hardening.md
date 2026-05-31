# JaraLingua Security Hardening Audit

Date: 2026-05-31

## Goal

Reduce corporate-security warnings by moving toward a stricter Content Security Policy and by documenting institutional trust controls.

## Current Production Strengths

- HTTPS is active.
- HSTS is active.
- `X-Content-Type-Options: nosniff` is active.
- `X-Frame-Options: SAMEORIGIN` is active.
- `Referrer-Policy: strict-origin-when-cross-origin` is active.
- `Permissions-Policy` restricts camera, microphone, geolocation, payment, USB, and fullscreen.
- `security.txt`, `robots.txt`, and `sitemap.xml` exist.

## Main Corporate Filter Triggers

- CSP currently allows `script-src 'unsafe-inline'`.
- CSP currently allows `style-src 'unsafe-inline'`.
- Current live HTML audit, excluding `chrome-tmp` snapshots, found 978 script, inline-style, or inline-handler occurrences.
- Many pages still use inline `<script>` blocks.
- Many pages still use inline event handlers such as `onclick`.
- Some pages load third-party services: Google Sign-In, Microsoft MSAL, and YouTube embeds.

## Hardening Plan For Items 3-5

1. Move page-specific inline scripts into files under `assets/js/pages/`.
2. Replace inline event handlers with `addEventListener`.
3. Move page-specific inline CSS into `assets/css/style.css` or a scoped stylesheet.
4. Test each course section after extraction.
5. Remove `unsafe-inline` from CSP only after the affected pages no longer depend on it.

## Institutional Pages Added

- `seguridad-privacidad.html`
- `privacidad.html`
- `terminos.html`
- `uso-de-datos.html`
- `tratamiento-de-datos.html`
- `tecnologia-proveedores.html`
- `modo-basico.html`
- `instituciones.html`
- `dominios-permitidos.html`
- `status.html`
- `accesibilidad.html`

## Server Header Step

Production should keep the active CSP compatible with current activities while adding `Content-Security-Policy-Report-Only` for a stricter future policy. This lets browser and corporate-security tests see the intended direction without breaking existing workshops.

## Suggested Refactor Order

1. New institutional pages: no inline scripts, no third-party auth.
2. Listening pages: extract quiz logic and transcript controls.
3. Workshop pages: extract worksheet download button handlers.
4. Interactive games: extract render and event logic.
5. Grade/auth pages: review separately because authentication and API calls are higher risk.

## Notes

Removing `unsafe-inline` in one global step is risky because many educational activities currently rely on inline JavaScript and inline styles. The safe approach is to reduce page groups in batches and verify each batch before changing the production CSP.
