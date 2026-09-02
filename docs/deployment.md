# Deployment runbook

UAT and production are separate Compose projects and databases. Both run the
same immutable image digest and join the existing `shared-net` network so Nginx
Proxy Manager can reach them without publishing a host port.

Database credentials are passed as separate connection fields rather than
interpolated into a URL, so randomly generated passwords may safely contain URL
reserved characters.

The database image is pinned to the current PostgreSQL 18 minor release. Before
changing that pin, create a custom-format `pg_dump` for each environment and
review every intervening PostgreSQL minor-release migration note. The upgrade
from clusters initialized on 18.0 also requires correcting the volatility of
`json_strip_nulls()` and `jsonb_strip_nulls()` in the application database and
both template databases after the new server starts.

Runtime configuration lives outside Git:

- `/home/imran/snipgraph.runtime/uat/app.env`
- `/home/imran/snipgraph.runtime/uat/compose.env`
- `/home/imran/snipgraph.runtime/prod/app.env`
- `/home/imran/snipgraph.runtime/prod/compose.env`

Build and verify the repository, then build one image:

```sh
pnpm check
docker build --pull --tag snipgraph-cms:<version> .
docker image inspect --format '{{index .RepoDigests 0}}' snipgraph-cms:<version>
```

Deploy UAT from the repository root:

```sh
docker compose --env-file /home/imran/snipgraph.runtime/uat/compose.env \
  -f deploy/compose.yaml up -d --wait
```

Verify `/api/health`, the landing page, OAuth metadata, the MCP authentication
challenge, and a draft/publish lifecycle. Only then deploy production with its
own `compose.env`. The `CMS_IMAGE` value must be identical in both environment
files. Nginx Proxy Manager forwards each public hostname to its corresponding
`PROXY_ALIAS` on port 3000 and terminates TLS.

## Backups, restore drills, and monitoring

Repository-owned user-systemd units run daily validated backups for each
environment, five-minute public smoke checks, and conservative monthly cleanup
of dangling project-labelled image layers. Install or refresh them with:

```sh
mkdir -p /home/imran/.config/systemd/user
cp deploy/systemd/* /home/imran/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now snipgraph-cms-backup@uat.timer snipgraph-cms-backup@prod.timer
systemctl --user enable --now snipgraph-cms-monitor@uat.timer snipgraph-cms-monitor@prod.timer
systemctl --user enable --now snipgraph-cms-prune.timer
```

Backups are private, atomic custom-format dumps under
`/home/imran/snipgraph.runtime/backups/{uat,prod}`. The default retention is 30
days and can be changed with `BACKUP_RETENTION_DAYS`. Verify the newest UAT dump
without touching the live database:

```sh
deploy/scripts/backup.sh uat
deploy/scripts/restore-check.sh uat
```

The restore check creates a uniquely named temporary database in the selected
environment, restores and queries it, then removes it even if verification
fails. Systemd journal output is the local monitoring record; external paging
is deliberately deferred until an alerting destination is selected.
