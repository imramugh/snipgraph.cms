# flow.mcp-content-operation.v1

An MCP client discovers OAuth metadata, obtains human-delegated authorization,
and receives only the scopes approved by the user. Read tools require content
read scope, draft mutations require content write scope, and publication
requires publish scope. MCP calls use the same schemas, concurrency checks,
revision records, and audit events as browser actions.

Tools return structured content plus readable text. Expected domain failures
are tool errors with a recovery instruction, not transport failures.
