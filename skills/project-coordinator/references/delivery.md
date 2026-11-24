# Deliver a change through its real entry point

## Trace one observable outcome

Start with a specific action or trigger and the result its caller can observe. Read the governing scenarios, any active change, and the closest working example. Compare the requested behavior with the actual implementation. A sample record or mockup can illustrate a case without defining its rules.

Follow the path from input to outcome. Depending on the project, that might be a screen interaction, command invocation, API call, or scheduled job. Locate the source of the data, who decides eligibility and ordering, where values are transformed or persisted, and who consumes them. Look for indirect consumers such as routing, deduplication, and saved configuration. For a UI, trace navigation, selection, scrolling, and responsive behavior in the closest peer screen before introducing local state or styles.

## Settle the contract

For a disputed behavior, record the current observation, the requirement or code that explains it, and a concrete input with the possible outcomes. Identify the decision owner when the evidence leaves a material product choice open. Continue work that is independent of that choice.

For example, if a command emits a count and an importer reads it, try both an omitted count and an explicit zero. Establish what each means, which side assigns a default, and how older records should read. Put the agreed examples into the acceptance scenarios and give each implementation task an observable completion check.

## Deliver and roll out the slice

Keep the necessary producer, boundary, and consumer changes together so one scenario exercises the full path. Reuse the peer implementation where it fits. Describe the specific requirement behind any departure. Identify an adjacent workflow that depends on the same component and include it in verification.

When components ship independently, identify which versions may coexist and in what order a compatible release can proceed. Include persisted data or settings that outlive a release. For a migration, document the mapping and the point at which recovery needs a backup or a forward fix. For an authorized rollout, record what actually shipped and exercise the entry point in the target environment.

## Review the evidence

Record each scenario's entry point, input or starting state, expected outcome, actual outcome, and evidence location. Name the revision and environment once per run. Label controlled fixtures and live interactions so a reader can see which boundaries each check exercised. Choose evidence that shows the consequence of the action, such as the resulting stored record, a command's exit status and output, or a settled screen capture labeled with its state and viewport.

Give an independent reviewer the change, agreed scenarios, and evidence. Have them trace a changed case and a neighboring case, check that the recorded outcome follows from the real entry point, and identify any missing coverage. Route ambiguous expectations back to planning and reproducible defects back to implementation. Rerun the affected checks after a fix. Keep skipped checks visible with their reason and the condition needed to run them.
