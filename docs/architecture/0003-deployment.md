# ADR 0003: Verify once and promote the same image

Status: accepted

UAT and production run separate Compose projects, databases, credentials,
networks, and volumes on the same VPS. They consume the same immutable CMS image.
The image is deployed and smoke-tested in UAT before its exact digest is promoted
to production. Runtime state lives under `/home/imran/snipgraph.runtime`, outside
the Git repository. Nginx Proxy Manager reaches each web container through the
external `shared-net` Docker network.

