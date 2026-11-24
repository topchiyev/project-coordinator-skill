## Context

The skill already uses OpenSpec for behavior changes and refreshes the dashboard after edits. It needs a threshold for substantial work beyond product behavior and explicit ownership for serving the refreshed dashboard.

## Decisions

- Reuse a matching active change or create one with the project's schema before implementation. Apply this to medium and large work even when product behavior stays the same.
- Refresh once after each logical OpenSpec update. The writer refreshes its checkout and the designated Coordinator refreshes the integrated checkout after integration.
- The designated Coordinator reuses or starts the dashboard server when feasible and shares a verified URL. Provide the generated HTML when serving is unavailable.
