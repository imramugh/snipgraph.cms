# screen.media-library.v1

Use for finding and managing reusable site images. The primary action uploads an
image; the populated state presents a responsive visual grid with filename,
dimensions, format, size, alternative text, and upload date. Selecting an asset
opens its details and metadata form in a drawer so the grid retains context.
Search works across filename and alternative text.

Uploads validate actual image content, allowed formats, and byte limits on the
server. Alternative text is required unless the asset is explicitly decorative.
Deleting an asset is unavailable while published or draft content references it.
Required states: loading, empty, uploading, populated, filtered-empty, invalid
file, and unavailable.
