# pattern.admin-application-shell.v1

Administrative routes use a stacked application shell on a subtle neutral
background. The first row contains product identity, primary destinations,
appearance controls, and the authenticated-user menu. A compact page header
below it carries route identity, status, and primary actions. Content is
constrained for lists and settings but may expand for the three-pane editor.

Desktop page editing uses three independently scannable columns: a narrow block
outline, a flexible primary editing form, and a sticky contextual inspector for
preview, publication state, and revision history. At narrower widths the form
remains primary and each secondary column moves into a labelled, focus-trapped
drawer. Closing a drawer restores focus to its trigger.

The shell supports system, light, and dark appearances. System is the default;
an explicit choice persists in the browser and is applied before first paint.
Administrative appearance is independent of the published site's theme.

Use shared controls for buttons, fields, badges, tables, cards, empty states,
alerts, menus, dialogs, drawers, and notifications. Destructive actions require
clear intent and confirmation. Save feedback uses an announced status region;
validation remains both field-local and summarized.
