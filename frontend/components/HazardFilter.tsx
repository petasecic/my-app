// 災害の種類で絞り込むボタン。件数は props で受け取るだけで、自分では取りに行かない。
import type { HazardKey } from "@/shared/hazards";
import type { HazardCount } from "@/shared/types";

type Props = {
  counts: HazardCount[];
  total: number;
  selected: HazardKey | null;
  onSelect: (hazard: HazardKey | null) => void;
};

export function HazardFilter({ counts, total, selected, onSelect }: Props) {
  const base = "rounded-full border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const on = "border-sky-700 bg-sky-700 text-white";
  const off = "border-slate-300 bg-white text-slate-700 hover:bg-slate-100";

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="災害の種類で絞り込む">
      <button
        type="button"
        className={`${base} ${selected === null ? on : off}`}
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
      >
        すべて（{total}）
      </button>
      {counts.map((hazard) => (
        <button
          key={hazard.key}
          type="button"
          className={`${base} ${selected === hazard.key ? on : off}`}
          aria-pressed={selected === hazard.key}
          disabled={hazard.count === 0}
          onClick={() => onSelect(hazard.key)}
        >
          {hazard.label}（{hazard.count}）
        </button>
      ))}
    </div>
  );
}
