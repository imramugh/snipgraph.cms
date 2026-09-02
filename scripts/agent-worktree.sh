#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/agent-worktree.sh create <task-id> [base-ref]
  scripts/agent-worktree.sh list
  scripts/agent-worktree.sh path <task-id>
  scripts/agent-worktree.sh remove <task-id>

Task IDs must use lowercase letters, numbers, dots, underscores, or hyphens.
EOF
}

common_git_dir=$(git rev-parse --path-format=absolute --git-common-dir)
repo_root=$(dirname "$common_git_dir")
repo_name=$(basename "$repo_root")
worktree_root=${SNIPGRAPH_WORKTREE_ROOT:-"$(dirname "$repo_root")/${repo_name}.worktrees"}

validate_task_id() {
  local task_id=$1
  if [[ ! $task_id =~ ^[a-z0-9][a-z0-9._-]*$ ]]; then
    printf 'Invalid task ID: %s\n' "$task_id" >&2
    usage >&2
    exit 2
  fi
}

task_path() {
  printf '%s/%s\n' "$worktree_root" "$1"
}

command_name=${1:-list}
case "$command_name" in
  create)
    task_id=${2:-}
    [[ -n $task_id ]] || { usage >&2; exit 2; }
    validate_task_id "$task_id"
    base_ref=${3:-origin/main}
    branch="agent/$task_id"
    path=$(task_path "$task_id")

    git -C "$repo_root" fetch origin main
    if git -C "$repo_root" show-ref --verify --quiet "refs/heads/$branch"; then
      printf 'Local branch already exists: %s\n' "$branch" >&2
      exit 1
    fi
    if git -C "$repo_root" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
      printf 'Remote branch already exists: %s\n' "$branch" >&2
      exit 1
    fi
    if [[ -e $path ]]; then
      printf 'Worktree path already exists: %s\n' "$path" >&2
      exit 1
    fi

    mkdir -p "$worktree_root"
    git -C "$repo_root" worktree add -b "$branch" "$path" "$base_ref"
    (
      cd "$path"
      corepack enable
      pnpm install --frozen-lockfile
    )
    printf 'Worktree ready: %s\nBranch: %s\n' "$path" "$branch"
    ;;
  list)
    git -C "$repo_root" worktree list
    ;;
  path)
    task_id=${2:-}
    [[ -n $task_id ]] || { usage >&2; exit 2; }
    validate_task_id "$task_id"
    task_path "$task_id"
    ;;
  remove)
    task_id=${2:-}
    [[ -n $task_id ]] || { usage >&2; exit 2; }
    validate_task_id "$task_id"
    branch="agent/$task_id"
    path=$(task_path "$task_id")

    [[ -d $path ]] || { printf 'Worktree does not exist: %s\n' "$path" >&2; exit 1; }
    if [[ -n $(git -C "$path" status --porcelain) ]]; then
      printf 'Worktree is dirty; commit or preserve its changes first: %s\n' "$path" >&2
      exit 1
    fi

    git -C "$repo_root" fetch origin main
    if ! git -C "$repo_root" merge-base --is-ancestor "$branch" origin/main; then
      printf 'Branch is not merged into origin/main: %s\n' "$branch" >&2
      exit 1
    fi

    git -C "$repo_root" worktree remove "$path"
    git -C "$repo_root" branch -d "$branch"
    printf 'Removed merged worktree: %s\n' "$path"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    printf 'Unknown command: %s\n' "$command_name" >&2
    usage >&2
    exit 2
    ;;
esac
