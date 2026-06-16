# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Smart Seaman BOS Web** — a Vue 3 back-office admin SPA for the Smart Seaman platform. It manages users, courses, certificates, vouchers, news, banners, forms, and roles.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server on :8080, proxies /v1 → https://api-dev.smartseaman.com
npm run build        # production build + preview
npm run preview      # preview built app on :10000
npm run lint         # ESLint with auto-fix (.vue, .js)
```

No automated test runner is configured. Verify changes manually via `npm run dev` and run `npm run lint` before any PR.

## Architecture

### Entry Points

- `src/main.js` — creates the Vue app, registers Pinia, Vue Router, Quasar, ApexCharts, global event bus (`mitt`), and shared components.
- `src/App.vue` — root component.
- `src/Policy.vue` — standalone privacy policy page (separate from the main admin app).

### Routing

`src/router/index.js` orchestrates all routes. Domain-specific route groups live in `src/router/*.routes.js`. The global navigation guard checks `authStore.user` (from `localStorage`) and redirects unauthenticated users to `/account/login`. Public paths: `/account/login`, `/account/register`, `/account/forgot`, `/privacy_policy`.

### Stores (Pinia)

All stores are re-exported from `src/stores/index.js`. Key stores:

- `auth.store.js` — login/logout, persists user object (including JWT) to `localStorage`.
- `alert.store.js` — global alert/notification state consumed across views.
- `menu-sidebar.store.js` — sidebar menu state.
- Domain stores: `courses`, `certificates`, `users`, `banners`, `newses`, `voucher`, `forms`, `roles`, `dashboard`.

### API Layer

`src/helpers/fetch-wrapper.js` — thin wrapper around the native `fetch` API. Reads `VITE_API_URL` from env to decide whether to attach the `Authorization: Bearer <token>` header. Auto-logs out on 401/403.

`src/stores/auth.store.js` uses `axios` directly (with custom headers `language`, `deviceModel`, `correlationid`, `deviceInfo`) for the login endpoint only.

All other API calls go through `fetchWrapper` using `VITE_BASE_URL_API` from the env file.

### Views

Feature screens in `src/views/<domain>/` follow this pattern:
- `Layout.vue` — wraps the domain section.
- `index.js` — barrel export for the domain's views.
- List, detail, `Add.vue`, `Edit.vue` as needed.

Shared layout (`src/views/Layout.vue`) wraps all authenticated pages.

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_BASE_URL_API` | Base URL for API calls (used in stores) |
| `VITE_API_URL` | API URL prefix used by `fetchWrapper` to decide auth header injection |

Dev: `https://api-dev.smartseaman.com` — Preview/prod: `https://api.smartseaman.com` (configured in `vite.config.js` proxy).

### Key Libraries

- **Quasar** + **TailwindCSS** + **DaisyUI** — UI components and styling (configured together; Quasar sass variables in `src/quasar-variables.sass`).
- **Vee-Validate** + **Yup** — form validation.
- **ApexCharts** / **Chart.js** — dashboard charts.
- **TinyMCE** (`@tinymce/tinymce-vue`) — rich text editor used in content forms.
- **mitt** — global event bus available as `this.emitter` on all components.

### Conventions

- 4-space indentation in JS and config files.
- PascalCase for Vue component filenames (e.g., `ImagePreviewBanner.vue`).
- `@` alias resolves to `src/`.
- Store files: `<domain>.store.js` in `src/stores/`.
- Route files: `<domain>.routes.js` in `src/router/`.
