#!/usr/bin/env bash
set -euo pipefail

environment_name=${1:?usage: smoke-test.sh uat|prod}
case "$environment_name" in uat) base_url=https://uat.cms.snipgraph.ai ;; prod) base_url=https://cms.snipgraph.ai ;; *) echo "environment must be uat or prod" >&2; exit 2 ;; esac

health=$(curl --fail --silent --show-error --max-time 15 "$base_url/api/health")
grep -q '"status":"ok"' <<< "$health"
curl --fail --silent --show-error --max-time 15 "$base_url/" > /dev/null
curl --fail --silent --show-error --max-time 15 "$base_url/.well-known/oauth-protected-resource/mcp" > /dev/null

challenge_headers=$(mktemp)
trap 'rm -f "$challenge_headers"' EXIT
status=$(curl --silent --show-error --max-time 15 -D "$challenge_headers" -o /dev/null -w '%{http_code}' \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_page_draft","arguments":{}}}' \
  "$base_url/mcp")
test "$status" = "401" || test "$status" = "403"
grep -qi 'scope="cms:content:write"' "$challenge_headers"
echo "$environment_name smoke test passed: $health"

