# screen.page-create.v1

Use when creating a routable page from the content list. Ask only for the
minimum viable identity: title, path, description, and starting recipe. Present
recipes as scannable starting points followed by a two-column form. Show the
resulting path before submission and place validation beside the relevant
field. Successful creation opens the full content editor; it never publishes.

Required states: ready, submitting, field-invalid, path-conflict, unavailable,
and permission denied.
