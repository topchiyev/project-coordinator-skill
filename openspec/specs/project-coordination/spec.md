# Project Coordination Specification

## Purpose

Coordinate a software change across distinct team roles and make its decisions, verification and progress portable between sessions.

## Requirements

### Requirement: Coordinate through OpenSpec

The Coordinator SHALL use the target project's OpenSpec workflow for behavior changes and require openspec-dashboard to refresh the dashboard after changes to specifications, tasks or archives.

#### Scenario: Resume an existing change

- **WHEN** the owner asks to continue a change from another session
- **THEN** the Coordinator reads its current requirements, decisions, task status and verification record before assigning the next slice

### Requirement: Assign and verify a delivery slice

The team SHALL distinguish planning, implementation and independent review, assign ownership for concurrent edits, and record observed verification results.

#### Scenario: A contract has an unresolved value

- **WHEN** a data contract leaves a material behavior undecided
- **THEN** the Architect records the affected case for the owner and the Developer can proceed with independent work

#### Scenario: Present work from an isolated checkout

- **WHEN** a Developer has verified a change in an isolated worktree
- **THEN** the Developer reports the revision and evidence, the Reviewer checks the diff, and the designated Coordinator handles any shared runtime update or user-facing preview
