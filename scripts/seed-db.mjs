// data/shizuoka-city-shelters.csv（国土地理院の CSV から静岡市の行だけを抜いたもの）を、
// DB（Neon の PostgreSQL）の3つの表に入れる。
//
//   hazards          災害の種類（8行）。キー、日本語のラベル、CSV の列の名前を持つ
//   shelters         避難する場所（1行が1か所）。主キーは CSV の「共通ID」
//   shelter_hazards  どの場所が、どの災害の種類に対応しているか（上の2つをつなぐ表）
//
// 動かすたびに3つの表を作り直し、CSV の中身で入れ直す。DB で直した値は、CSV の値に戻る。
//
// 使い方（先に .env.local に DATABASE_URL を入れておく）:
//   npm run db:seed

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL がありません。.env.local に DATABASE_URL を入れてください。");
  process.exit(1);
}

// 災害の種類。CSV では8つの列に分かれている。key は画面と API で使う名前（shared/hazards.ts と同じ）。
const HAZARDS = [
  { key: "flood", label: "洪水", csvColumn: "洪水" },
  { key: "landslide", label: "崖崩れ・土石流・地滑り", csvColumn: "崖崩れ、土石流及び地滑り" },
  { key: "stormSurge", label: "高潮", csvColumn: "高潮" },
  { key: "earthquake", label: "地震", csvColumn: "地震" },
  { key: "tsunami", label: "津波", csvColumn: "津波" },
  { key: "fire", label: "大規模な火事", csvColumn: "大規模な火事" },
  { key: "inlandFlood", label: "内水氾濫", csvColumn: "内水氾濫" },
  { key: "volcano", label: "火山現象", csvColumn: "火山現象" },
];

// 引用符つきのフィールド（カンマ・改行・"" を含むもの）に対応した簡易 CSV パーサ
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((v) => v !== "")) rows.push(row);
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((name, i) => [name, values[i] ?? ""])));
}

const here = dirname(fileURLToPath(import.meta.url));
const records = parseCsv(readFileSync(resolve(here, "../data/shizuoka-city-shelters.csv"), "utf8"));

// CSV の1行を、shelters の1行に変える。NO（通し番号）は使わない。データが更新されると変わるため。
const shelters = records.map((r) => ({
  id: r["共通ID"],
  name: r["施設・場所名"],
  address: r["住所"],
  lat: Number(r["緯度"]),
  lng: Number(r["経度"]),
  note: r["備考"].trim() === "" ? null : r["備考"].trim(),
  sameAddressAsEvacuationCenter: r["指定避難所との住所同一"] === "1",
}));

// 8つの列の「1」を、shelter_hazards の行に変える（1つの場所に、対応する種類の数だけ行ができる）
const links = records.flatMap((r) =>
  HAZARDS.filter((h) => r[h.csvColumn] === "1").map((h) => ({ shelterId: r["共通ID"], hazardKey: h.key })),
);

const bad = shelters.filter((s) => !s.id || Number.isNaN(s.lat) || Number.isNaN(s.lng));
if (bad.length > 0) {
  console.error(`共通ID か緯度・経度が読めない行があります: ${bad.map((s) => s.name).join("、")}`);
  process.exit(1);
}

const sql = neon(url);

// 表を作り直す。つなぐ表は、ほかの2つを参照しているので先に消し、あとに作る。
// 前の版の shelters（カナや収容人数の列を持つ表）も、ここで消える。
await sql`DROP TABLE IF EXISTS shelter_hazards`;
await sql`DROP TABLE IF EXISTS shelters`;
await sql`DROP TABLE IF EXISTS hazards`;

await sql`
  CREATE TABLE hazards (
    key        text PRIMARY KEY,
    label      text NOT NULL,
    csv_column text NOT NULL UNIQUE,
    sort_order integer NOT NULL
  )
`;
await sql`
  CREATE TABLE shelters (
    id                                text PRIMARY KEY,
    name                              text NOT NULL,
    address                           text NOT NULL,
    lat                               double precision NOT NULL,
    lng                               double precision NOT NULL,
    note                              text,
    same_address_as_evacuation_center boolean NOT NULL DEFAULT false
  )
`;
await sql`
  CREATE TABLE shelter_hazards (
    shelter_id text NOT NULL REFERENCES shelters (id) ON DELETE CASCADE,
    hazard_key text NOT NULL REFERENCES hazards (key),
    PRIMARY KEY (shelter_id, hazard_key)
  )
`;

// 1行ずつ送ると402回の通信になるので、列ごとの配列にまとめて1回で入れる（unnest で配列を行に戻す）
await sql`
  INSERT INTO hazards (key, label, csv_column, sort_order)
  SELECT * FROM unnest(
    ${HAZARDS.map((h) => h.key)}::text[],
    ${HAZARDS.map((h) => h.label)}::text[],
    ${HAZARDS.map((h) => h.csvColumn)}::text[],
    ${HAZARDS.map((_, i) => i + 1)}::integer[]
  )
`;
await sql`
  INSERT INTO shelters (id, name, address, lat, lng, note, same_address_as_evacuation_center)
  SELECT * FROM unnest(
    ${shelters.map((s) => s.id)}::text[],
    ${shelters.map((s) => s.name)}::text[],
    ${shelters.map((s) => s.address)}::text[],
    ${shelters.map((s) => s.lat)}::double precision[],
    ${shelters.map((s) => s.lng)}::double precision[],
    ${shelters.map((s) => s.note)}::text[],
    ${shelters.map((s) => s.sameAddressAsEvacuationCenter)}::boolean[]
  )
`;
await sql`
  INSERT INTO shelter_hazards (shelter_id, hazard_key)
  SELECT * FROM unnest(
    ${links.map((l) => l.shelterId)}::text[],
    ${links.map((l) => l.hazardKey)}::text[]
  )
`;

const counts = await sql`
  SELECT h.label, count(sh.shelter_id)::int AS count
  FROM hazards h
  LEFT JOIN shelter_hazards sh ON sh.hazard_key = h.key
  GROUP BY h.key, h.label, h.sort_order
  ORDER BY h.sort_order
`;
const [{ total }] = await sql`SELECT count(*)::int AS total FROM shelters`;

console.log(`shelters の表に ${total} 件、shelter_hazards の表に ${links.length} 件を入れました。`);
console.log(counts.map((c) => `${c.label} ${c.count}件`).join("、"));
