// 共通: フロントエンドとバックエンドの「約束事」。
// APIが返す形はここで決める。どちらか一方だけで勝手に変えない。

import type { HazardKey } from "./hazards";

// 指定緊急避難場所 1か所分（国土地理院の指定緊急避難場所データの列に対応）
// 1件は「施設」ではなく「避難する場所」。静岡県のデータには、同じ学校のグラウンドと体育館が別の行になっている市もある。
export type Shelter = {
  id: string; // 共通ID（国土地理院のデータで、場所ごとに決まっている番号）
  name: string; // 施設・場所名
  address: string; // 住所
  lat: number; // 緯度
  lng: number; // 経度
  hazards: HazardKey[]; // 対応する災害の種類
  note?: string; // 備考（住所の補足など）
  sameAddressAsEvacuationCenter: boolean; // 指定避難所と同じ住所か
};

// 災害の種類ごとの件数（GET /api/hazards の1行）
export type HazardCount = {
  key: HazardKey;
  label: string;
  count: number;
};

// GET /api/shelters の返り値
export type ShelterListResponse = {
  shelters: Shelter[];
  total: number;
};

// GET /api/shelters/[id] の返り値
export type ShelterDetailResponse = {
  shelter: Shelter;
};

// GET /api/hazards の返り値
export type HazardCountListResponse = {
  hazards: HazardCount[];
};

// エラー時の返り値
export type ApiErrorResponse = {
  error: string;
};
