---
name: project-coordinator
description: Coordinate software delivery with a designated Coordinator, an Architect, a Developer, and an independent Reviewer. Use for team planning, implementation handoffs, review, verification, and shared previews in projects using OpenSpec and openspec-dashboard.
---

# Project coordinator

Use the designated Coordinator conversation as the entry point on each development host. Keep decisions and progress in the repository so a new conversation or another machine can resume from the same evidence.

## Pick up a request

1. Read the project's instructions, OpenSpec configuration, applicable capability scenarios, relevant active changes, and the runbook for any component involved. Check the current branch, local edits, active worktrees, and work already assigned.
2. Establish the outcome the user wants now. An investigation can end with findings and open questions. A planning request can end with a validated change. For implementation, identify the observable acceptance cases and adjacent behavior to preserve.
3. Use **OpenSpec** for product behavior and change progress. Extend the matching active change where appropriate. For a new behavior change, use the project's OpenSpec workflow and schema. Keep infrastructure, setup and runtime instructions in the project's developer documentation.
4. Require the **openspec-dashboard** skill. Refresh after each batch of changes to OpenSpec, including task status and archival. Confirm the dashboard reflects the integrated checkout before presenting it. If a dependency is missing, identify what needs setup and continue any independent investigation.

## Assign and hand off work

| Role | Ownership | Handoff |
| --- | --- | --- |
| Coordinator | Scope, assignments, integration, shared runtime, user acceptance, specification sync and archive | Give each agent its base revision, worktree, owned files or behavior, constraints and completion check. Keep track of builds and services using shared resources. |
| Architect | Inspect working peers and the whole data path. Record observations, assumptions and unresolved decisions. Prepare the proposal, scenarios, design and verifiable tasks required by the project. | Give the Developer the agreed contract, examples, reuse candidates and adjacent scenarios. Bring material product choices to the owner with a concrete case. |
| Developer | Implement one verifiable slice in its assigned worktree. Keep callers, data contracts, and consumers consistent. Update affected developer docs and record actual checks in the active change. | Give the Coordinator the base and revision or patch, affected components, evidence and skipped checks. |
| Reviewer | Independently inspect the exact diff against the request, applicable scenarios and evidence. Exercise affected workflows where permitted. | Report findings by impact, with locations and consequences. Route ambiguous requirements to the Architect and defects to the Developer. Recheck material fixes. |

Use role-based agent names, adding a scope when needed, such as `developer_import`. Parallelize independent assignments. Give concurrent writers distinct ownership and worktrees; integrate the agreed planning artifacts before handing off implementation. For a change spanning hosts, name one Coordinator to integrate the revisions. Assign a single writer for shared task and evidence files during each batch. Other Developers return their scenario results for that writer to record. If separate agents are unavailable, keep the steps distinct and disclose when review was a self-check. For Codex hosts, four optional role profiles live in [assets/agents](assets/agents/).

Use the host’s model and reasoning settings for each role. Where the owner has set a usage threshold, check the available allowance before substantial parallel work and report a low balance once per quota window. Keep account-specific preferences in the host configuration.

For changes that cross components or alter an existing workflow, follow the [delivery guide](references/delivery.md). Prefer working patterns already in the project. Share an abstraction when it keeps current callers consistent or removes substantial duplication. Give a concrete reason for introducing an alternative.

## Run and present

- Agents can build and run isolated components using their own outputs, temporary data and available loopback ports. Follow the host's limits on concurrent builds.
- Only the designated Coordinator session on that host operates the shared stack or presents previews, demos and the dashboard. Check process ownership, listeners and active users before replacing a component. Preserve user-managed processes. Build first, replace the affected component, then verify readiness through its user-facing path and relevant dependencies.
- For UI work, exercise the real entry point with representative states and supported screen sizes. When a set of screenshots helps review, capture settled screens, label scenario and viewport, and group them in a small gallery. Verify shared links, assets and access using the project's existing preview mechanism. For non-UI work, supply the equivalent observable result.

## Finish the change

Update each OpenSpec checkbox when its stated completion condition is met. Record the checks run, their results and any remaining acceptance owner. Keep implementation, independent verification, user acceptance and deployment distinguishable when they happen at different times. Validate the affected change with OpenSpec and regenerate the dashboard with openspec-dashboard. After integration, verify the combined revision and resolve outstanding findings.

Use the project's approval and release process for commits, pushes, deployments, spec sync and archival. When publishing, verify the destination revision. At closure, follow the project's OpenSpec archive workflow and refresh the dashboard again. Report the delivered outcome and anything the next session still needs to verify.
