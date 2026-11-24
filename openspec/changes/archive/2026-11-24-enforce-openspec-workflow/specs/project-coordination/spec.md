## MODIFIED Requirements

### Requirement: Coordinate through OpenSpec

The Coordinator SHALL use the target project's OpenSpec change workflow for product behavior changes and for all medium or large changes unless the user explicitly opts out. Before implementation, the Coordinator SHALL extend a matching active change or create one using the project's schema and capture scope, relevant decisions, and verifiable tasks.

#### Scenario: Resume an existing change

- **WHEN** the owner asks to continue a change from another session
- **THEN** the Coordinator reads its current requirements, decisions, task status and verification record before assigning the next slice

#### Scenario: Plan substantial work

- **WHEN** a medium or large change is requested, including a change to infrastructure or tooling
- **THEN** the Coordinator reuses or creates an OpenSpec change before implementation and keeps its artifacts current as work proceeds

#### Scenario: Honor an explicit opt-out

- **WHEN** the user explicitly asks to handle the work outside the OpenSpec change workflow
- **THEN** the Coordinator follows that instruction and tracks the agreed scope and verification as appropriate

## ADDED Requirements

### Requirement: Keep the OpenSpec dashboard current and available

The author of an OpenSpec update SHALL use openspec-dashboard to refresh the dashboard in the updated checkout after each logical update, including changes to structure, artifacts, and task status. The designated Coordinator SHALL refresh the integrated dashboard after integrating OpenSpec updates and serve it when feasible through the project's preview mechanism.

#### Scenario: Change the OpenSpec structure or progress

- **WHEN** an OpenSpec change is created, edited, moved, removed, synced, or archived, or a specification, task status, or other OpenSpec artifact is updated
- **THEN** the responsible agent refreshes the dashboard for the affected checkout when that update is complete

#### Scenario: Present the refreshed dashboard

- **WHEN** the integrated dashboard has been refreshed
- **THEN** the designated Coordinator reuses or starts the dashboard server when feasible and shares a verified, reachable URL, or provides the generated HTML when serving is unavailable
