# MCP access

Snipgraph CMS exposes a remote, OAuth-protected MCP endpoint in each environment:

- UAT: `https://uat.cms.snipgraph.ai/mcp`
- Production: `https://cms.snipgraph.ai/mcp`

Use the production URL as a custom remote MCP server in a client that supports
Streamable HTTP and interactive OAuth. The client discovers the protected
resource and authorization server automatically, opens the Snipgraph sign-in
and consent flow, and returns with a scoped token. No long-lived CMS API key is
required.

## Scopes

- `cms:content:read` lists pages and reads current state, revisions, and audit context.
- `cms:content:write` creates pages, appends validated drafts, and uploads media.
- `cms:publish` publishes the exact page or settings draft sequence supplied by the caller.

Request only the scopes needed by the client. Draft writes never publish as a
side effect, and every update must provide `expectedSequence` to prevent silent
lost updates. If a client starts with read permission and later invokes a write
or publish tool, the MCP endpoint returns an OAuth insufficient-scope challenge
for that operation so an interactive client can request the additional consent.

## Resources

- `reference://catalog`
- `cms://catalog/blocks`
- `cms://catalog/marketing` — all 179 governed Marketing pattern entries
- `cms://catalog/page-recipes` — ten editable starting compositions
- `cms://catalog/theme` — typography, palette, and named-scheme contract
- `cms://site/settings`
- `cms://media`
- `cms://pages/{pageId}/history`

## Tools

- `list_pages`
- `read_page`
- `read_page_history`
- `create_page_draft`
- `update_page_draft`
- `publish_page`
- `read_site_settings`
- `update_site_settings_draft`
- `publish_site_settings`
- `list_media`
- `upload_media`
- `update_media_metadata`

Claude Desktop is the initial supported operator client. The MCP Inspector is a
useful protocol-level diagnostic client; other remote MCP clients can connect
when they support interactive OAuth and the Streamable HTTP transport.

Page block writes use a semantic block `type` and one of the `variants`
advertised by `cms://catalog/blocks`. Persistent header, flyout, banner, footer,
not-found, typography, and palette choices live in the revisioned site-settings
value rather than page blocks. Agents must read the relevant catalog resource
before constructing or changing these values.
