import { GET as protectedResourceMetadata } from "../route";

export const dynamic = "force-dynamic";

export function GET() {
  return protectedResourceMetadata();
}
