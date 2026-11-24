# Project Coordinator Skill

Coordinate an agent team on a software project. The Coordinator owns the request and the shared development environment. The Architect investigates and plans, the Developer implements a verifiable slice, and the Reviewer checks it independently. Decisions, task progress and evidence stay with the project.

The same [Agent Skills](https://agentskills.io/specification) package works with Codex, Claude Code, GitHub Copilot, Cursor, and other agents that load `SKILL.md` bundles.

## Install

Install at the **target repository root by default**, using the project skills directory for the current or named agent. Use a personal installation when the user requests it. If the request and workspace still leave the target repository, agent, or scope unclear, the installing agent should ask the user before writing files.

1. Install the [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec) in the environment where the agents work. If the target project is new to OpenSpec, run `openspec init` from its root and select the applicable agent integrations. Reuse an existing OpenSpec setup.
2. Make [openspec-dashboard](https://github.com/topchiyev/openspec-dashboard-skill#install) available to the agents too. Follow its installation guide for the project skill directory and install its generator dependencies in each environment that generates dashboards.
3. Copy the complete [project-coordinator directory](skills/project-coordinator/) under the project skills directory below. Run this example from the target repository on macOS or Linux. It uses `.agents/skills/`. For Claude Code, set `skill_dir=".claude/skills/project-coordinator"`.

   ```sh
   (
     set -e
     project_root="$(git rev-parse --show-toplevel)"
     cd "$project_root"
     skill_dir=".agents/skills/project-coordinator"
     skill_source="$(mktemp -d)"
     trap 'rm -r -- "$skill_source"' EXIT
     git clone --depth 1 https://github.com/topchiyev/project-coordinator-skill.git "$skill_source"
     mkdir -p "$(dirname "$skill_dir")"
     mkdir "$skill_dir"
     cp -R "$skill_source/skills/project-coordinator/." "$skill_dir/"
   )
   ```

   If you already have a source checkout, copy its `skills/project-coordinator/` directory. If the destination already exists, inspect it and preserve any project customizations when upgrading. Include the copied files in version control to share the skill with other contributors and worktrees. Open or reload the agent in the target project and confirm it can find `project-coordinator`.

4. Designate one Coordinator conversation per development host. In the target project's agent instructions, record the OpenSpec and runbook locations, shared runtime ownership, and any project-specific acceptance rules. Use the role assignments in the skill with your agent's delegation tools or separate sessions. Codex users can also copy the optional [role profiles](skills/project-coordinator/assets/agents/) into `.codex/agents/` at the target repository root and merge with any existing profiles.

### Project skills directories

Paths are relative to the repository root. Add `project-coordinator/` under the selected directory. If several agents use a common path, they can share one copy. For an agent outside this table, use its documented project-level Agent Skills directory.

| Agent | Project skills directory | Documentation |
| --- | --- | --- |
| Codex | `.agents/skills/` | [Codex](https://developers.openai.com/codex/skills) |
| Claude Code | `.claude/skills/` | [Claude Code](https://code.claude.com/docs/en/skills) |
| GitHub Copilot | `.github/skills/` | [GitHub](https://docs.github.com/en/copilot/concepts/customizations/agent-skills), [VS Code](https://code.visualstudio.com/docs/agent-customization/agent-skills) |
| Cursor | `.agents/skills/` or `.cursor/skills/` | [Cursor](https://cursor.com/docs/skills) |
| Gemini CLI | `.agents/skills/` or `.gemini/skills/` | [Gemini CLI](https://geminicli.com/docs/cli/skills/) |
| Google Antigravity | `.agents/skills/` | [Antigravity](https://antigravity.google/docs/skills) |
| OpenCode | `.agents/skills/` or `.opencode/skills/` | [OpenCode](https://opencode.ai/docs/skills/) |
| Devin Local | `.agents/skills/` or `.devin/skills/` | [Devin Local](https://docs.devin.ai/desktop/devin-local/customizations) |
| Windsurf | `.windsurf/skills/` | [Windsurf](https://docs.windsurf.com/windsurf/cascade/skills) |
| Cline | `.cline/skills/` | [Cline](https://docs.cline.bot/customization/skills) |
| Roo Code | `.agents/skills/` or `.roo/skills/` | [Roo Code](https://roocodeinc.github.io/Roo-Code/features/skills/) |
| Kiro | `.kiro/skills/` | [Kiro](https://kiro.dev/docs/skills/) |
| Junie | `.agents/skills/` or `.junie/skills/` | [Junie](https://junie.jetbrains.com/docs/agent-skills.html) |
| Amp | `.agents/skills/` | [Amp](https://ampcode.com/docs/customize/skills) |
| Goose | `.agents/skills/` | [Goose](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/context-engineering/using-skills.md) |

## Try it

> Use the project-coordinator skill to plan the import retry change. Find the current entry point, record what happens after a partial failure, and bring me any decisions about duplicate imports before implementation.

For an implementation request, point the Coordinator at the approved OpenSpec change. Ask it to show the dashboard to see which checks have passed and what still needs acceptance.
