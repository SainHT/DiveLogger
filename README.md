# Scuba Log

Scuba Log is a local-first dive logbook organized as an npm workspace
monorepo.

## Workspace layout

- `shared/` contains the domain models, gas and dive-planning rules, telemetry
  helpers, and Dexie repositories shared by the clients.
- `web/` contains the existing React/Vite dashboard. Its HTML-based views stay
  isolated from mobile code.
- `mobile/` contains the Expo/React Native client. All mobile-first widgets,
  screens, and native design tokens live under `mobile/android-ui/`.

The `@scuba-log/shared/*` TypeScript alias is available to both client
workspaces. The web Vite config resolves the same alias at runtime.

## Commands

Install all workspace dependencies from the repository root:

```sh
npm install
```

Run or build the web client:

```sh
npm run dev
npm run build
```

Start the Expo client:

```sh
npm run start --workspace mobile
npm run android --workspace mobile
```
