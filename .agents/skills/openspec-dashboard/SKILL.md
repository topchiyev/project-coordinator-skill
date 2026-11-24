---
name: openspec-dashboard
description: Generate, refresh, show, serve, or stop the dashboard for an OpenSpec project. Use for dashboard requests and after you modify a project's OpenSpec specifications, changes, task status, or archives.
metadata:
  version: "0.1.1"
---

# OpenSpec Dashboard

Determine the project root from the current repository or the project the user named. Use its applicable project instructions for the dashboard output path. The default is `openspec/dashboard.html`. Resolve the scripts relative to the directory containing this `SKILL.md` and run them with Node.js 20.19 or newer.

Keep generated dashboard HTML out of Git. Before generating or serving it in a Git repository, check whether the output path is ignored with `git check-ignore`. For an untracked output that needs an ignore rule, add a pattern anchored to the repository root for that exact file to the local exclude file (`git rev-parse --git-path info/exclude`). Keep generated HTML out of staging and commits. If the dashboard is already tracked, tell the user and get approval before untracking it.

## Install

For an installation request, place the full skill folder in the target repository's project skills directory for the agent the user names. Default to the current agent when the user leaves the agent unspecified. Use a personal skills directory or install for multiple agents only when the user explicitly requests that scope or those targets.

If the intended repository, agent, or scope remains unclear after applying these defaults, ask the user to clarify before installing.

## Show or serve

When the user asks to see, open, or serve the dashboard, use the bundled server.

```sh
node /path/to/openspec-dashboard/scripts/serve-dashboard.mjs serve --project-root /path/to/project
```

Link the URL printed by the command. It reuses an active server for this project and generates the dashboard if the HTML is missing. Pass `--output` for a configured dashboard path. The server binds to loopback and picks an available port. For a fixed forwarded port, pass `--port PORT` when starting it. If the user is on another device, use the environment's forwarded URL when available. Otherwise, identify the URL as local to the machine running the server.

## Check or stop

Use `status` in place of `serve` to check whether the project's server is running. Use `stop` to stop it. Give both commands the same `--project-root`.

## Generate or refresh

After you create, edit, or archive OpenSpec changes, update task checkboxes, or modify specifications, regenerate the project's dashboard once at the end of that batch of edits. Do this before reporting completion, even if the user did not separately request a refresh.

```sh
node /path/to/openspec-dashboard/scripts/generate-dashboard.mjs --project-root /path/to/project
```

Pass `--output` for a configured dashboard path. Link the generated HTML or, if the server is running, its existing URL. Reloading the page shows the regenerated HTML. If the command fails, report the cause from its output.

If generation dependencies are missing, run `npm ci --ignore-scripts` from the bundled skill directory. Serving existing HTML uses only Node.js.
