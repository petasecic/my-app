"use client";

// 地図。避難場所を丸い印で置く。データは props で受け取るだけで、自分では取りに行かない。
// Leaflet はブラウザの中でしか動かないので、使う側で next/dynamic（ssr: false）を通して読み込む。

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Shelter } from "@/shared/types";

// 静岡市役所のあたり。データが0件のときの中心
const DEFAULT_CENTER: [number, number] = [34.9756, 138.3828];

// cacheComponents が有効だと、ページを離れても画面は破棄されず「非表示」で保持される。
// 非表示になるときに Leaflet の地図は後始末で壊れるのに、再表示で子の部品が壊れた地図へ
// 戻ろうとして落ちる。そこで、非表示のあいだは地図ごと外し、再表示で新しく作り直す。
export default function ShelterMap({ shelters }: { shelters: Shelter[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 画面が出たあとの次のフレームで地図を作る（effect の中で直接 state は変えない）
    const id = requestAnimationFrame(() => setVisible(true));
    return () => {
      cancelAnimationFrame(id);
      setVisible(false);
    };
  }, []);

  return visible ? <LeafletMap shelters={shelters} /> : <MapPlaceholder />;
}

function MapPlaceholder() {
  return <div className="h-[420px] w-full rounded-lg bg-slate-100" />;
}

function LeafletMap({ shelters }: { shelters: Shelter[] }) {
  const bounds =
    shelters.length > 0
      ? (shelters.map((s) => [s.lat, s.lng]) as [number, number][])
      : undefined;

  return (
    <MapContainer
      // 絞り込みで場所が変わったら、地図を作り直して表示範囲を合わせる
      key={`${shelters.length}:${shelters[0]?.id ?? ""}:${shelters.at(-1)?.id ?? ""}`}
      bounds={bounds}
      center={bounds ? undefined : DEFAULT_CENTER}
      zoom={bounds ? undefined : 12}
      boundsOptions={{ padding: [24, 24] }}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-lg border border-slate-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shelters.map((shelter) => (
        <CircleMarker
          key={shelter.id}
          center={[shelter.lat, shelter.lng]}
          radius={6}
          pathOptions={{ color: "#0369a1", fillColor: "#0ea5e9", fillOpacity: 0.7, weight: 1 }}
        >
          <Popup>
            <Link href={`/shelters/${shelter.id}`} className="font-bold">
              {shelter.name}
            </Link>
            <br />
            {shelter.address}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
