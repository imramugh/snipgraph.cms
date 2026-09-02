# Snipgraph CMS working agreement

## Design before implementation

Every product change begins in `features/<feature-id>/feature.json`. Confirm the
story, reference pattern IDs, data requirements, permissions, acceptance
criteria, fixtures, and MCP impact before changing application code.

If the required screen, flow, or block is missing from `references/catalog`,
add or revise the reference specification as part of the feature. Do not invent
an undocumented product pattern inside a route or component.

## Shared behavior

Admin UI, inline editing, scripts, and MCP tools must call the same application
service. Do not duplicate validation, authorization, revision, publishing, or
audit logic in an adapter.

## Verification loop

Run the smallest relevant test while developing, then run `pnpm check` before a
change is considered ready. Exercise affected MCP tools with their contract
tests. A deployable change is complete only after UAT deployment, smoke checks,
promotion of the exact verified image to production, and production checks.

## Parallel worktrees and protected integration

The primary checkout on `main` is for coordination, integration, and releases.
Do not implement product changes directly in it. Every parallel task must use
its own worktree and `agent/<task-id>` branch created from current
`origin/main`:

```sh
scripts/agent-worktree.sh create <task-id>
```

Use one task per worktree and do not let two agents own the same files or
feature specification at the same time. Agents may inspect other worktrees but
must edit, stage, commit, and test only inside their assigned worktree. Shared
runtime configuration and deployments are integration responsibilities; a
feature-worktree agent must not deploy independently.

Before opening a pull request, run `pnpm check` plus affected browser and MCP
contract tests, commit every intended file, and confirm the worktree is clean.
Push the task branch and integrate only through a pull request into protected
`main`. Never force-push or commit directly to `main`. After the pull request is
merged and `origin/main` contains the branch, remove the worktree with:

```sh
scripts/agent-worktree.sh remove <task-id>
```

See `docs/parallel-development.md` for the full lifecycle and recovery rules.

## Licensed inputs

`tailwindplus.packages/` is a local, licensed design input. It must never be
added to Git, copied into documentation, or placed in a container build context.
The identified Tailwind Plus Marketing and Application UI components are
approved for use in this public repository. This approval does not change the
exclusion of the downloaded source packages above.
