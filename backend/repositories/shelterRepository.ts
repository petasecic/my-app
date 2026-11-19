import "server-only";

// サーバーの層（データの出し入れ）。DB（Neon の PostgreSQL）に問い合わせるのは、このファイルだけ。
// DB は3つの表に分かれている（hazards、shelters、shelter_hazards）。表のつなぎ方は scripts/seed-db.mjs を見る。

import { neon } from "@neondatabase/serverless";
import { isHazardKey } from "@/shared/hazards";
import type { HazardCount, Shelter } from "@/shared/types";

// shelters の1行に、つなぐ表からまとめた災害の種類（配列）を足した形
type ShelterRow = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  note: string | null;
  same_address_as_evacuation_center: boolean;
  hazards: string[];
};

type HazardCountRow = {
  key: string;
  label: string;
  count: number;
};

// DB の接続先は環境変数 DATABASE_URL から読む。Vercel で DB をつなぐと自動で入る。
function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL がありません。.env.local を作ったか確かめてください");
  }
  return neon(url);
}

// DB の1行を Shelter に変換する。知らない災害の種類は捨てる（画面が壊れないように）。
function toShelter(row: ShelterRow): Shelter {
  const shelter: Shelter = {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    hazards: row.hazards.filter(isHazardKey),
    sameAddressAsEvacuationCenter: row.same_address_as_evacuation_center,
  };
  if (row.note) shelter.note = row.note;
  return shelter;
}

// 場所の表に、つなぐ表をたどって災害の種類を集めてくる。対応する種類がない場所も残す（LEFT JOIN）。
export async function findAllShelters(): Promise<Shelter[]> {
  const sql = db();
  const rows = (await sql`
    SELECT s.*,
           coalesce(array_agg(h.key ORDER BY h.sort_order) FILTER (WHERE h.key IS NOT NULL), '{}') AS hazards
    FROM shelters s
    LEFT JOIN shelter_hazards sh ON sh.shelter_id = s.id
    LEFT JOIN hazards h ON h.key = sh.hazard_key
    GROUP BY s.id
  `) as ShelterRow[];
  return rows.map(toShelter);
}

export async function findShelterById(id: string): Promise<Shelter | undefined> {
  const sql = db();
  const rows = (await sql`
    SELECT s.*,
           coalesce(array_agg(h.key ORDER BY h.sort_order) FILTER (WHERE h.key IS NOT NULL), '{}') AS hazards
    FROM shelters s
    LEFT JOIN shelter_hazards sh ON sh.shelter_id = s.id
    LEFT JOIN hazards h ON h.key = sh.hazard_key
    WHERE s.id = ${id}
    GROUP BY s.id
  `) as ShelterRow[];
  return rows[0] ? toShelter(rows[0]) : undefined;
}

// 災害の種類ごとの件数。種類の表とつなぐ表を数えるだけで出る（表を3つに分けた理由の1つ）。
export async function countSheltersByHazard(): Promise<HazardCount[]> {
  const sql = db();
  const rows = (await sql`
    SELECT h.key, h.label, count(sh.shelter_id)::int AS count
    FROM hazards h
    LEFT JOIN shelter_hazards sh ON sh.hazard_key = h.key
    GROUP BY h.key, h.label, h.sort_order
    ORDER BY h.sort_order
  `) as HazardCountRow[];
  return rows
    .filter((row) => isHazardKey(row.key))
    .map((row) => ({ key: row.key as HazardCount["key"], label: row.label, count: Number(row.count) }));
}
