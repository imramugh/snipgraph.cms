# ADR 0001: Shared application core with adapter boundaries

Status: accepted

Snipgraph CMS uses one application/domain layer for admin, inline editing, MCP,
and scripts. Adapters translate transport-specific identity and inputs into
commands. Repositories own persistence. The domain owns content validation,
revision concurrency, publication rules, and audit intent.

This prevents MCP from becoming a privileged side door and allows transport
contract tests to reuse the same behavioral scenarios.

