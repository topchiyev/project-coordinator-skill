## ADDED Requirements

### Requirement: Announce delegated model selections

After selecting models and reasoning effort for delegated roles, the Coordinator SHALL tell the user the selection for each role before dispatch. The Coordinator SHALL identify settings controlled by the runtime and report a change or newly confirmed setting when it becomes known.

#### Scenario: Role settings are selected for a dispatch batch

- **WHEN** the Coordinator selects model and effort for one or more roles
- **THEN** the Coordinator provides a single progress update that identifies each selected role and its model and effort before dispatching it

#### Scenario: The runtime changes or resolves a setting

- **WHEN** dispatch requires a fallback or reveals the value of a runtime default that was previously unknown
- **THEN** the Coordinator tells the user which model or effort changed or became known for the affected role
