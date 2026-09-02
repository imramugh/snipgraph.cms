# pattern.inline-media-studio.v1

Every media-bearing authoring field shows the current image and opens the same
media studio without navigating away or discarding unsaved content. The studio
offers Library and Upload views. Library search shows accessible metadata and
dimensions before selection.

Upload previews the local file before persistence and provides aspect-ratio,
zoom, rotation, and crop-position controls. Alternative text is required unless
the editor explicitly marks the image decorative. Save produces a cropped image,
uploads it through the governed media endpoint, selects its stable media ID, and
leaves the resulting asset available in the shared library.

Closing the studio before saving uploads nothing. Object URLs are released when
files change or the studio closes. Keyboard focus is trapped by the modal and is
returned to the invoking control.
