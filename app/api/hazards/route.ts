import "server-only";

// バックエンドの入口（災害の種類ごとの件数）。service を呼んで JSON で返すだけ。

import { listHazardCounts } from "@/backend/services/shelterService";
import type { HazardCountListResponse } from "@/shared/types";

export async function GET() {
  const hazards = await listHazardCounts();
  return Response.json({ hazards } satisfies HazardCountListResponse);
}
