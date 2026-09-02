# flow.draft-publish.v1

Published content points to an immutable revision. Editing starts from the newest
draft, or forks the published revision when no draft exists. Save validates and
creates a new draft sequence. Preview renders that sequence in authenticated
context. Publish atomically points the public item at the selected draft sequence
and records an audit event.

