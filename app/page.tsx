const businesses = [
  {
    name: "楽器・音響機器",
    body: "ピアノ、管弦打楽器、ギター、デジタル楽器、音響機器まで。音楽を「つくる・奏でる・届ける」ための製品を幅広く展開しています。",
  },
  {
    name: "音楽教室・音楽文化",
    body: "ヤマハ音楽教室を通じて、子どもから大人まで音楽を学び楽しむ場を世界中に提供しています。",
  },
  {
    name: "モーターサイクル・マリン",
    body: "1955年にヤマハ発動機として独立。二輪車、マリン製品、電動アシスト自転車などモビリティ分野へ展開しています。",
  },
];

const history = [
  { year: "1887", text: "山葉寅楠が浜松でリードオルガンの製作に成功" },
  { year: "1897", text: "日本楽器製造株式会社を設立" },
  { year: "1955", text: "二輪事業を分離し、ヤマハ発動機が発足" },
  { year: "1987", text: "社名を「ヤマハ株式会社」に変更" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-[0.3em]">YAMAHA</span>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#business" className="hover:text-red-600">
              事業
            </a>
            <a href="#history" className="hover:text-red-600">
              沿革
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24">
          <p className="mb-4 text-sm font-semibold tracking-widest text-red-600">
            YAMAHA
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            感動を・ともに・創る
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            ヤマハは、1887年の創業以来、音と技術で人々の暮らしに感動を届けてきました。
            楽器・音響から、モビリティまで、そのものづくりの精神は今も続いています。
          </p>
        </section>

        <section
          id="business"
          className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <h2 className="mb-10 text-2xl font-bold">事業紹介</h2>
            <ul className="grid gap-6 sm:grid-cols-3">
              {businesses.map((b) => (
                <li
                  key={b.name}
                  className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
                >
                  <h3 className="mb-3 text-lg font-semibold">{b.name}</h3>
                  <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {b.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="history" className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <h2 className="mb-10 text-2xl font-bold">沿革</h2>
            <ol className="space-y-6">
              {history.map((h) => (
                <li key={h.year} className="flex gap-6">
                  <span className="w-16 shrink-0 text-lg font-bold text-red-600">
                    {h.year}
                  </span>
                  <span className="leading-7">{h.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © YAMAHA (サンプルページ)
      </footer>
    </div>
  );
}
