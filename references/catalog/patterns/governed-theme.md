# pattern.governed-theme.v1

Public presentation is controlled through global semantic theme tokens. Three
typographic roles—display, body, and monospace—reference validated Google Fonts
families and explicit weights. Text styles such as headings, body copy,
eyebrows, quotations, navigation, and buttons consume those roles rather than
declaring fonts independently.

Color primitives are assigned to semantic roles and composed into named
schemes. Blocks may select only a registered scheme; arbitrary per-element or
per-block colors are unavailable. Critical text and action pairs must meet WCAG
contrast requirements before a settings draft can be saved.

Theme configuration is part of site settings, so it receives immutable
revisions, optimistic concurrency, audit attribution, preview, and explicit
publication alongside the rest of the public shell.

