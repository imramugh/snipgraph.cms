# pattern.block-composer.v1

A block composer is driven by the same versioned block catalog used for content
validation and MCP schemas. It supports adding, selecting, configuring,
reordering, and removing blocks. Stable block identifiers survive reordering.
Configuration uses a contextual panel and never hides the page-level save,
preview, or publish state.

Destructive removal requires an explicit action and remains reversible until
the draft is saved. Unknown or newer block versions render a safe diagnostic
instead of being discarded.
