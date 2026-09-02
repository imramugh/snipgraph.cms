# pattern.inline-editing.v1

Authenticated editors see a restrained editing toolbar on the rendered site.
Hover identifies editable blocks without shifting layout. Activating a block
opens a dismissible contextual panel. Saving creates a draft revision through
the shared application service; it never changes public content. Preview and
publish remain explicit and expose the current revision sequence.

The editing layer must be absent for anonymous visitors, keyboard accessible,
usable on narrow screens, and unable to obscure the selected content entirely.
