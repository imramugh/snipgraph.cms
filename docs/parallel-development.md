# Parallel development

Snipgraph CMS uses a protected `main` branch and one Git worktree per active
task. This keeps parallel agents from sharing a working tree, index, branch, or
build output while still sharing the repository object database.

## Start a task

From any existing checkout, create a lowercase task ID containing letters,
numbers, dots, underscores, or hyphens:

```sh
scripts/agent-worktree.sh create cms-015-navigation
```

The command fetches current `origin/main`, creates branch
`agent/cms-015-navigation`, adds a sibling worktree under
`snipgraph.cms.worktrees/`, and installs the locked dependencies. The resulting
path is printed when setup completes. Set `SNIPGRAPH_WORKTREE_ROOT` before the
command only when the worktrees need to live somewhere else.

Assign each task a disjoint feature or file set. If two tasks need the same
service, schema, feature specification, or shared component, sequence them or
make that shared work its own prerequisite pull request.

## Develop and publish

All edits, staging, commits, and tests belong in the task worktree. Begin
product changes in `features/<feature-id>/feature.json` and follow the root
working agreement. Before publishing a branch:

```sh
pnpm check
git status --short
git push -u origin agent/cms-015-navigation
gh pr create --base main --fill
```

Run affected browser and MCP contract tests in addition to `pnpm check`. The
pull request must pass the required `verify` check and be current with `main`.
Resolve review conversations before merging. Use squash or rebase merging so
protected `main` remains linear.

Parallel task agents do not update shared runtime files or deploy. After merge,
the integration agent updates the primary checkout, verifies the exact merged
commit, deploys one immutable image to UAT, performs smoke and acceptance
checks, then promotes that same image to production.

## Finish a task

After the pull request is merged:

```sh
git fetch origin main
scripts/agent-worktree.sh remove cms-015-navigation
```

Removal refuses dirty worktrees and refuses branches not contained in
`origin/main`. GitHub deletes the merged remote branch automatically; the
helper removes the merged local branch and worktree.

Use `scripts/agent-worktree.sh list` to inspect all worktrees. If a task is
abandoned with uncommitted work, preserve or explicitly discard that work
before cleanup; never use forced worktree removal as routine recovery.

## Licensed design inputs

`tailwindplus.packages/` remains local to the primary licensed workspace. It is
ignored by Git and Docker and must never be copied into a worktree, commit,
pull request, artifact, or container context. Product-owned derivative code is
allowed under the recorded approval.
