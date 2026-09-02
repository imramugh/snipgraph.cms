#!/usr/bin/env bash
set -euo pipefail

# Only dangling layers bearing Snipgraph's project label and older than 30 days
# are eligible. Docker never prunes an image used by a container.
docker image prune --force \
  --filter 'dangling=true' \
  --filter 'label=ai.snipgraph.project=cms' \
  --filter 'until=720h'

