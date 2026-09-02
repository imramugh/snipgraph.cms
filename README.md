# Snipgraph CMS

Snipgraph CMS is a block-based, draft-first web content management system with
first-class Model Context Protocol (MCP) access and authenticated in-page
editing.

## Repository status

This repository is public with approval to include the Tailwind-derived product
code built from the identified Tailwind Plus Marketing and Application UI
components. The downloaded Tailwind Plus packages remain local design inputs
and are excluded from Git and container build contexts; do not commit,
redistribute, or publish those source packages.

## Product principles

- The reference framework is consulted before a feature is designed.
- Browser, inline-editor, and MCP operations share the same application layer.
- Published content is immutable; every change begins as a draft revision.
- Feature quality is designed in through stories, fixtures, acceptance criteria,
  and reference conformance rather than deferred to a final CI gate.
- UAT verifies an immutable container image before that exact image is promoted
  to production.

See `docs/architecture` and `features` for the current specifications.

## MVP environments

- UAT: <https://uat.cms.snipgraph.ai>
- Production: <https://cms.snipgraph.ai>
- Production MCP endpoint: <https://cms.snipgraph.ai/mcp>

The CMS supports the complete licensed Marketing pattern inventory as governed
page-block variants, site chrome, system screens, and editable page recipes. A
published global theme controls Google Fonts and semantic color schemes without
raw per-block styling. It also supports typed page blocks, page creation, search and status filtering,
immutable draft revisions, authenticated previews, explicit publication,
revision/audit history, and contextual editing on the live page. Google and
LinkedIn provide owner sign-in. MCP clients use interactive OAuth and receive
the same validation, revision-conflict, and publication boundaries as browser
operations.

See `docs/mcp.md` for the MCP resources, tools, scopes, and client setup model,
`docs/parallel-development.md` for protected worktree-based development, and
`docs/deployment.md` for immutable UAT-to-production promotion.
