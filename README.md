# Project Coordinator Skill

Coordinate an agent team on a software project. The Coordinator owns the request and the shared development environment. The Architect investigates and plans, the Developer implements a verifiable slice, and the Reviewer checks it independently. Decisions, task progress and evidence stay with the project.

## Install

1. Install the [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec) on the machine where the agents work. If the target project is new to OpenSpec, run `openspec init` from its root and select your agent tooling. In an existing OpenSpec project, use its existing setup.
2. Install the [openspec-dashboard skill](https://github.com/topchiyev/openspec-dashboard-skill#install), including its generator dependencies, in the same environment. The coordinator workflow requires both OpenSpec and openspec-dashboard.
3. Clone this repository and install its complete [project-coordinator skill directory](skills/project-coordinator/) in the skills directory your agent uses. For a personal Codex installation on macOS or Linux:

   ```sh
   git clone https://github.com/topchiyev/project-coordinator-skill.git
   mkdir -p ~/.agents/skills
   destination="$HOME/.agents/skills/project-coordinator"
   if [ -e "$destination" ] || [ -L "$destination" ]; then
     ls -ld "$destination"  # Inspect the existing installation.
   else
     ln -s "$(pwd)/project-coordinator-skill/skills/project-coordinator" "$destination"
   fi
   ```

   If you already have the checkout, link directly to its `skills/project-coordinator` directory. Claude Code can use the same skill in `~/.claude/skills/`. For a project-scoped install, copy the full directory under the target project's `.agents/skills/` (Codex) or `.claude/skills/` (Claude Code).

4. Designate a Coordinator conversation for the host. In the target project's agent instructions, record its OpenSpec and runbook locations, shared runtime ownership and any project-specific acceptance rules. Codex users can copy the four [role profiles](skills/project-coordinator/assets/agents/) into the target project's `.codex/agents/`. Merge with existing role files if present. Other runtimes can use the role assignments in the skill directly.

## Try it

> Use the project-coordinator skill to plan the import retry change. Find the current entry point, record what happens after a partial failure, and bring me any decisions about duplicate imports before implementation.

For an implementation request, point the Coordinator at the approved OpenSpec change. Ask it to show the dashboard to see which checks have passed and what still needs acceptance.
