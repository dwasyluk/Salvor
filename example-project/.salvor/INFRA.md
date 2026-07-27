# Notebook Infrastructure

Operational reference: running locally, deployment, env vars, external APIs, observability.

## Local
Two components, run independently:

- **api** (port 8787 by default):
  ```bash
  cd api
  npm install
  npm run dev        # tsx src/server.ts → http://localhost:8787
  ```
- **web** (static page, no server required for the demo):
  ```bash
  cd web
  npm install
  npm run typecheck  # tsc --noEmit
  ```
  Then open `web/index.html` directly, or serve it (e.g. `npx serve web` / `python3 -m http.server`).
  The page calls the api at `http://localhost:8787`, so start the api first.

Typecheck both before declaring work done: `npm run typecheck` in each component.

## Deployment
None. This is a local-only worked example — there is no deployment target, container, or ingress.

## Env vars
| Var | Component | Where consumed | Default |
|-----|-----------|----------------|---------|
| `PORT` | api | `src/server.ts` (`process.env.PORT ?? 8787`) | `8787` |
| `APP_NAME` | api | startup-log display name (`src/server.ts`) | `Notebook` |

The static web client reads its display name from `data-app-name` on the root
element in `web/index.html`; `src/main.ts` applies that configured value to the
document title and heading.

The `web` API base (`http://localhost:8787`) is a module constant in `src/main.ts`; change it there if the api port moves.

## External APIs
The only cross-component "external" call is `web` → `api` over HTTP (`GET/POST/DELETE /notes`). The api sends permissive
CORS headers (`Access-Control-Allow-Origin: *`) so the static page can call it from a different origin. There are no
third-party APIs, no auth, and no rate limits.

## Observability
The api logs a single startup line (`<APP_NAME> API listening on …`) to stdout. No metrics or dashboards in the demo.
