#!/usr/bin/env bash
set -euo pipefail
umask 077

environment_name=${1:?usage: backup.sh uat|prod}
case "$environment_name" in uat|prod) ;; *) echo "environment must be uat or prod" >&2; exit 2 ;; esac

repo_root=/home/imran/snipgraph.cms
runtime_root="/home/imran/snipgraph.runtime/$environment_name"
backup_root="/home/imran/snipgraph.runtime/backups/$environment_name"
retention_days=${BACKUP_RETENTION_DAYS:-30}
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$backup_root/snipgraph-cms-$environment_name-$timestamp.dump"
temporary="$target.partial"
mkdir -p "$backup_root"
trap 'rm -f "$temporary"' EXIT

compose=(docker compose --env-file "$runtime_root/compose.env" -f "$repo_root/deploy/compose.yaml")
"${compose[@]}" exec -T db pg_dump -U snipgraph -d snipgraph_cms -Fc > "$temporary"
test -s "$temporary"
"${compose[@]}" exec -T db pg_restore --list < "$temporary" > /dev/null
mv "$temporary" "$target"
find "$backup_root" -type f -name 'snipgraph-cms-*.dump' -mtime "+$retention_days" -delete
echo "$target"

