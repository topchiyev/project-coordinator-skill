# Choose models and reasoning effort

Resolve model and effort independently. Use the Coordinator session's current settings as selected by the user or inherited from their host configuration. For delegated roles, apply any explicit role settings from the user or project, then fill in the remaining settings using the defaults below. If an override is unavailable, state the fallback and use the best supported settings for that role unless the user required the override as a condition of dispatch.

| Role | Model | Reasoning effort |
| --- | --- | --- |
| Coordinator | User-selected session model | User-selected session effort |
| Architect | Current frontier model available for planning and software reasoning | High |
| Developer | Current balanced coding workhorse one tier below frontier, with the tools and context needed to implement and verify the change | Medium |
| Reviewer | Current frontier model available for independent software review | High |

For example, a host with GPT-6.2 Astra as its frontier model and GPT-6.2 Sol as its workhorse would choose Astra high for Architect and Reviewer and Sol medium for Developer. A Coordinator already running Sol high would continue with Sol high. Reapply the role criteria as the host's available models change.

## Discover what the host can use

1. Check the execution environment for the assignment. Start with the delegation tool's choices, the active profile, the runtime's model picker or list, and any current catalog the runtime already has. Check the model, reasoning levels, and required capabilities on the surface that will run the role. A bundled catalog can describe capability and effort. A live picker or account-aware list establishes which options are selectable, subject to the delegation tool's own limits.
2. Use the runtime's current tier descriptions or the provider's positioning to identify the strongest available model for the role's software work and the balanced coding tier immediately below it. Compare task-relevant capabilities across providers when the host offers several. Within a tier, favor the provider's current recommended release with the needed tools and context, then consider latency and cost. Use release dates to distinguish versions within a family and tier.
3. Use zero HTTP requests when current local information settles availability, tier, and effort. When network access is available and the local availability list is missing or stale, request the execution surface's account-aware model list once if it offers one. If a candidate's tier or effort remains unclear and would affect the assignment, fetch the provider's official model comparison or documentation once for the candidates together. Make one targeted documentation lookup only if a remaining gap would change the selection. Reuse availability results across roles and assignments on the same host and account during the session, and reuse provider documentation wherever it describes the same models. Recheck the relevant information when the host, account, provider, or available options change, or when the runtime rejects a setting. Use only catalogs and documentation for discovery.

## Map the effort on the selected model

Use the requested `high` or `medium` value when the execution surface exposes it for the selected model. Otherwise use a documented equivalent for that model. For high, look for a deep reasoning setting suitable for complex analysis. For medium, look for the provider's balanced setting for routine coding. Use a numeric thinking budget only when the provider documents a corresponding budget for that model. If the mapping is unclear or the surface only exposes automatic or default reasoning, use that setting and report it as such. Apply model and effort through the host's supported assignment settings.

## Handle gaps in availability

- If no suitable workhorse is available, use the frontier model at medium or its documented equivalent for the Developer. If only one suitable model is selectable, reuse it across roles and vary effort where supported.
- If discovery is incomplete, including when offline, choose from known selectable models using the latest accessible metadata. If the tier cannot be established, use a known suitable host default. When the runtime controls a setting, inherit its default and state the actual model or effort if visible.
- If a setting is rejected at dispatch, refresh availability once and retry with a supported fallback. If the host can only provide the current session, apply the skill's single-session handoff and review guidance.

## Tell the user what you selected

After selecting the model and effort, give the user one concise progress update covering the roles in the dispatch batch. Name the role, model, and effort before dispatch. Label any setting left to the runtime as its default. If you choose a fallback after a rejection, tell the user about the new selection before retrying. If dispatch reveals a different setting or resolves a runtime default, tell the user what the role actually uses when it becomes known.

Record the actual model and effort for each delegated role when visible, along with any fallback that affected the assignment. Keep account-specific choices in the host configuration.
