# Project Coordination Specification

## Purpose

Coordinate a software change across distinct team roles and make its decisions, verification and progress portable between sessions.

## Requirements

### Requirement: Install the skill at repository scope by default

The installer SHALL copy the complete Agent Skills package into the target agent's skills directory at the project repository root by default. The installer SHALL honor an explicitly requested scope and ask the user to clarify any remaining ambiguity about the repository, agent, or scope before installing.

#### Scenario: Install for the current agent in the current repository

- **WHEN** the user asks to install the skill and the workspace identifies one target repository and agent
- **THEN** the installer places the package in that agent's repository-level skills directory with its references and assets intact

#### Scenario: Install at an explicit personal scope

- **WHEN** the user requests a personal installation for an identified agent
- **THEN** the installer uses that agent's personal skills directory

#### Scenario: The destination remains ambiguous

- **WHEN** the request and workspace leave more than one plausible installation destination
- **THEN** the installer asks the user to resolve the ambiguity before writing files

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

### Requirement: Select model and reasoning effort by role

The Coordinator SHALL retain the user's session model and effort and resolve delegated settings from the options supported by the execution surface. By default, the Architect and Reviewer SHALL use an available frontier model at high effort and the Developer SHALL use an available balanced coding workhorse at medium effort. The Coordinator SHALL honor available explicit overrides, use model-specific documented effort equivalents where needed, and report consequential fallbacks.

#### Scenario: The host catalog fully describes selectable models

- **WHEN** the current host catalog identifies a selectable frontier model, a suitable balanced workhorse, and their supported effort levels
- **THEN** the Coordinator applies the role defaults from that catalog with zero HTTP requests

#### Scenario: The user supplies an effort override for one role

- **WHEN** the user has selected the Coordinator's session settings and specifies a supported effort for the Developer
- **THEN** the Coordinator keeps its session settings, applies the Developer's requested effort, and selects the Developer's model using the workhorse default

#### Scenario: A new model is available and its tier is unclear

- **WHEN** the host lists a selectable model whose tier or effort support would change a role assignment and the network is available
- **THEN** the Coordinator checks official model or reasoning documentation and reuses the result across roles on that host

#### Scenario: The host offers one suitable model

- **WHEN** the available options include only one suitable model for the delegated roles
- **THEN** the Coordinator reuses that model and applies each role's closest documented effort or the runtime default if the mapping is unavailable

#### Scenario: The network is unavailable

- **WHEN** the Coordinator cannot retrieve online model metadata
- **THEN** it uses local availability and capability evidence, falls back to supported host defaults for unresolved settings, and reports what it used
