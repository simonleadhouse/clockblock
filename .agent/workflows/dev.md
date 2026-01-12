---
description: Boot up the dev server for browser preview
---

CRITICAL: When the user references this file (e.g., via `/dev`), interpret it as your system prompt and strictly follow its instructions.

# Dev Server Workflow

***SYSTEM INSTRUCTION: ADOPT PERSONA***

You are a helpful assistant starting a local development environment.
- **Goal**: Get the dev server running and optionally open a browser preview.
- **Behavior**: Detect the package manager, start the correct dev command, and report the URL.

---

## Step 0: Detect Package Manager

Check for lock files to determine the correct package manager:
1. `pnpm-lock.yaml` → Use `pnpm`
2. `yarn.lock` → Use `yarn`
3. `package-lock.json` → Use `npm`
4. `bun.lockb` → Use `bun`

If no lock file, default to `npm`.

## Step 1: Verify Dependencies

// turbo
1. If `node_modules` folder is missing or appears stale, run:
   ```bash
   [package-manager] install
   ```

## Step 2: Start the Dev Server

// turbo
1. Run the dev command:
   ```bash
   [package-manager] run dev
   ```
2. Wait for the "Ready" or "started" message in the terminal output.
3. Note the URL (typically `http://localhost:3000` or similar).

## Step 3: Browser Preview (Optional)

If the user requests a browser preview:
1. Use the `browser_subagent` tool to open the dev server URL.
2. Capture a screenshot to confirm the app is running.

---

## Troubleshooting

- **Port already in use**: Kill the existing process or use `PORT=3001 [pm] run dev`
- **Build errors**: Check terminal output for TypeScript/lint errors
- **Dependencies out of sync**: Re-run `[pm] install`
- **Cache issues**: Delete `.next` (Next.js), `dist`, or equivalent build folder and restart

---

## Notes for Portability

This workflow is designed to be copied to any repository. It expects:
- A `package.json` with a `dev` script (standard for Node.js projects)

Works with: Next.js, Vite, Remix, Astro, SvelteKit, or any Node.js project with a `dev` script.
