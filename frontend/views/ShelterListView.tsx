"use client";

// 一覧画面。データは sheltersApi 経由で取る。絞り込みのルールはバックエンドが持つ。
// 上から、災害の種類で絞り込むボタン（種類ごとの件数つき）、地図、カードの一覧。

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchHazardCounts, fetchShelters } from "@/frontend/api/sheltersApi";
import { DataNotice } from "@/frontend/components/DataNotice";
import { HazardFilter } from "@/frontend/components/HazardFilter";
import { Header } from "@/frontend/components/Header";
import { ShelterCard } from "@/frontend/components/ShelterCard";
import { ErrorMessage, LoadingMessage } from "@/frontend/components/StatusMessage";
import type { HazardKey } from "@/shared/hazards";
import type { HazardCount, Shelter } from "@/shared/types";

// 地図（Leaflet）はブラウザの中でしか動かないので、サーバーでは描かない
const ShelterMap = dynamic(() => import("@/frontend/components/ShelterMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-lg bg-slate-100" />,
});

export function ShelterListView() {
  const [hazard, setHazard] = useState<HazardKey | null>(null);
  const [shelters, setShelters] = useState<Shelter[] | null>(null);
  const [counts, setCounts] = useState<HazardCount[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 種類ごとの件数と、全体の件数は、最初に1回だけ取る
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchHazardCounts(), fetchShelters()])
      .then(([hazardCounts, all]) => {
        if (cancelled) return;
        setCounts(hazardCounts);
        setTotal(all.length);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "不明なエラーです");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 選んだ種類が変わるたびに、サーバーに絞り込んでもらう
  useEffect(() => {
    let cancelled = false;
    fetchShelters({ hazard: hazard ?? undefined })
      .then((data) => {
        if (!cancelled) setShelters(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "不明なエラーです");
      });
    return () => {
      cancelled = true;
    };
  }, [hazard]);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">静岡市の指定緊急避難場所</h1>
        <p className="mb-4 text-sm text-slate-600">
          災害の種類を選ぶと、その災害のときに避難できる場所だけを表示します。
        </p>
        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="flex flex-col gap-5">
            <HazardFilter
              counts={counts}
              total={total}
              selected={hazard}
              onSelect={(next) => {
                setShelters(null);
                setHazard(next);
              }}
            />
            {shelters === null ? (
              <LoadingMessage />
            ) : (
              <>
                <ShelterMap shelters={shelters} />
                <p className="text-sm text-slate-600">{shelters.length}件</p>
                {shelters.length === 0 ? (
                  <p className="text-slate-600">該当する避難場所はありません。</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {shelters.map((shelter) => (
                      <ShelterCard key={shelter.id} shelter={shelter} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <DataNotice />
    </>
  );
}
