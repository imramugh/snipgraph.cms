import { requireActor, requireMutationActor } from "@/lib/actor";
import { problem } from "@/lib/http";
import { createMedia, listMedia } from "@/lib/media";
import { defaultSite } from "@/lib/site";

export async function GET(request: Request) {
  try {
    await requireActor(request.headers, "admin");
    const currentSite = await defaultSite();
    return Response.json({ media: await listMedia(currentSite.id) });
  } catch (error) {
    return problem(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const currentSite = await defaultSite();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose an image to upload." }, { status: 422 });
    }
    const asset = await createMedia({
      siteId: currentSite.id,
      filename: file.name,
      altText: String(form.get("altText") ?? ""),
      decorative: form.get("decorative") === "true",
      bytes: new Uint8Array(await file.arrayBuffer()),
      actor,
    });
    return Response.json({ asset }, { status: 201 });
  } catch (error) {
    return problem(error);
  }
}

