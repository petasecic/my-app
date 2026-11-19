"use client";

// 地図。避難場所を丸い印で置く。データは props で受け取るだけで、自分では取りに行かない。
// Leaflet はブラウザの中でしか動かないので、使う側で next/dynamic（ssr: false）を通して読み込む。

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Shelter } from "@/shared/types";

// 静岡市役所のあたり。データが0件のときの中心
const DEFAULT_CENTER: [number, number] = [34.9756, 138.3828];

export default function ShelterMap({ shelters }: { shelters: Shelter[] }) {
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
