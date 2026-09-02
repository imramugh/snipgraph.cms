# pattern.media-picker.v1

Image-bearing block and settings fields select an existing asset from the shared
media library and show a stable thumbnail, filename, and alternative text. The
picker embeds `pattern.inline-media-studio.v1` so upload, preview, crop, metadata,
save, and selection happen without discarding unsaved field values. Content stores
the asset identifier rather than a deployment-specific file path.

Broken or unavailable references render a visible editor diagnostic and a safe
public placeholder. Selection is keyboard accessible and never infers alt text
from a filename without explicit confirmation.
