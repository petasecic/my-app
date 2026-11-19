import "server-only";

// サーバーの層（ルール）。絞り込み・並べ替え・「見つからない」の判断はここで行う。
// データの読み込みは repository に任せる。HTTPのことは知らない（Response は作らない）。

import {
  countSheltersByHazard,
  findAllShelters,
  findShelterById,
} from "@/backend/repositories/shelterRepository";
import type { HazardKey } from "@/shared/hazards";
import type { HazardCount, Shelter } from "@/shared/types";

export type ShelterSearchOptions = {
  hazard?: HazardKey;
  q?: string;
};

// 並べ替えは住所の順（本物のデータにはカナの列がないため。住所の順にすると、区ごとにまとまる）
export async function listShelters(options: ShelterSearchOptions = {}): Promise<Shelter[]> {
  const all = await findAllShelters();
  const keyword = options.q?.trim();

  return all
    .filter((s) => (options.hazard ? s.hazards.includes(options.hazard) : true))
    .filter((s) => (keyword ? s.name.includes(keyword) || s.address.includes(keyword) : true))
    .sort((a, b) => a.address.localeCompare(b.address, "ja"));
}

// 見つからないときは null を返す（404にするかどうかは route 側が決める）
export async function getShelter(id: string): Promise<Shelter | null> {
  const shelter = await findShelterById(id);
  return shelter ?? null;
}

// 災害の種類ごとの件数。件数が0の種類も返す（画面で「0件」と見せるかは画面が決める）
export async function listHazardCounts(): Promise<HazardCount[]> {
  return countSheltersByHazard();
}
