# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 admin web app built with Vite. Application code lives in `src/`.
Top-level entry points are `src/main.js`, `src/App.vue`, and `src/Policy.vue`.
Routes are split by domain under `src/router/*.routes.js`; keep new route groups in
that pattern. Feature screens live in `src/views/<feature>/`, usually with
`Layout.vue`, list/detail pages, and `Add.vue` or `Edit.vue` forms. Shared UI
components are in `src/components/`, Pinia stores are in `src/stores/`, API and
utility helpers are in `src/helpers/`, and styles/assets are in `src/assets/`.
Static public files belong in `public/`. Build output in `dist/` is generated.

## Build, Test, and Development Commands

Use npm; this repository includes `package-lock.json`.

- `npm install`: install dependencies.
- `npm run dev`: start Vite on port `8080` with `/v1` proxied to the dev API.
- `npm run build`: create a production build, then start `vite preview`.
- `npm run preview`: preview the built app on port `10000`.
- `npm run serve`: run the build and preview sequence.
- `npm run lint`: run ESLint over Vue and JavaScript files with auto-fix enabled.

## Coding Style & Naming Conventions

Follow the existing Vue single-file component style and use 4-space indentation
in JavaScript and config files. Name Vue components in PascalCase, such as
`ImagePreviewBanner.vue`, and group feature-specific views by folder, such as
`src/views/courses/Edit.vue`. Store modules use lower-case domain names with a
`.store.js` suffix, for example `src/stores/courses.store.js`. Prefer the `@`
alias for imports from `src`.

## Testing Guidelines

No automated test runner is currently configured. Before opening a pull request,
run `npm run lint` and manually exercise affected pages through `npm run dev`.
If tests are added later, place unit tests near the related module or under a
clear test directory, and use `*.spec.js` naming.

## Commit & Pull Request Guidelines

The current Git history only contains `Initial commit`, so no project-specific
commit convention is established. Use short, imperative commit messages, such as
`Add course edit validation`. Pull requests should include a concise summary,
affected routes or screens, manual test notes, linked issue or ticket when
available, and screenshots for visible UI changes.

## Security & Configuration Tips

Environment files are mode-specific: `.env.development` and `.env.production`.
Do not commit secrets or hard-code API credentials. Vite proxy settings live in
`vite.config.js`; verify the target API before changing `/v1` behavior.
