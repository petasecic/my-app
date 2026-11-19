import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "会社概要 | ヤマハ",
  description: "ヤマハの会社概要",
};

const profile = [
  { label: "名称", value: "ヤマハ株式会社 (Yamaha Corporation)" },
  { label: "創業", value: "1887年" },
  { label: "設立", value: "1897年 (日本楽器製造株式会社として)" },
  { label: "本社所在地", value: "静岡県浜松市" },
  { label: "主な事業", value: "楽器事業、音響機器事業 ほか" },
  { label: "関連会社", value: "ヤマハ発動機株式会社 (1955年設立、静岡県磐田市)" },
];

export default function About() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-[0.3em]">
            YAMAHA
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-red-600">
              ホーム
            </Link>
            <Link href="/about" className="text-red-600">
              会社概要
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <p className="mb-4 text-sm font-semibold tracking-widest text-red-600">
            ABOUT
          </p>
          <h1 className="text-4xl font-bold tracking-tight">会社概要</h1>

          <dl className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {profile.map((p) => (
              <div key={p.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-zinc-500">{p.label}</dt>
                <dd className="leading-7">{p.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/"
            className="mt-12 inline-block text-sm font-medium text-red-600 hover:underline"
          >
            ← トップページへ戻る
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © YAMAHA (サンプルページ)
      </footer>
    </div>
  );
}
