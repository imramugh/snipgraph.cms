#!/usr/bin/env bash
set -euo pipefail

environment_name=${1:?usage: restore-check.sh uat|prod [dump]}
case "$environment_name" in uat|prod) ;; *) echo "environment must be uat or prod" >&2; exit 2 ;; esac

repo_root=/home/imran/snipgraph.cms
runtime_root="/home/imran/snipgraph.runtime/$environment_name"
backup_root="/home/imran/snipgraph.runtime/backups/$environment_name"
dump_path=${2:-$(find "$backup_root" -type f -name 'snipgraph-cms-*.dump' -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)}
test -n "$dump_path" && test -s "$dump_path"
drill_db="snipgraph_restore_$(date -u +%Y%m%d%H%M%S)"
compose=(docker compose --env-file "$runtime_root/compose.env" -f "$repo_root/deploy/compose.yaml")

cleanup() {
  "${compose[@]}" exec -T db dropdb -U snipgraph --if-exists "$drill_db" >/dev/null 2>&1 || true
}
trap cleanup EXIT

"${compose[@]}" exec -T db createdb -U snipgraph "$drill_db"
"${compose[@]}" exec -T db pg_restore -U snipgraph -d "$drill_db" --no-owner --no-privileges < "$dump_path"
"${compose[@]}" exec -T db psql -U snipgraph -d "$drill_db" -v ON_ERROR_STOP=1 -Atc \
  "select count(*) from site; select count(*) from content_revision; select count(*) from drizzle.__drizzle_migrations;"
echo "restore drill passed: $dump_path"

