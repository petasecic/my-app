// データの出典と、国土地理院の「ご利用上の注意」。第三者に見せるときは、この注意を伝える決まりがある。
export function DataNotice() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs leading-relaxed text-slate-600">
        <p>
          出典：
          <a
            href="https://www.gsi.go.jp/bousaichiri/hinanbasho.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            国土地理院「指定緊急避難場所データ」
          </a>
          （静岡県のデータから、静岡市の402件を抜き出して加工）
        </p>
        <p>
          このデータは、災害対策基本法にもとづいて市町村長が指定した指定緊急避難場所を、各市町村が国土地理院に登録したものです。最新でない場合や載っていない場合があるため、最新かつ詳しい状況は、必ず静岡市に確かめてください。指定緊急避難場所は、災害の種類ごとに指定されています（指定避難所とは別のものです）。データは随時更新されます。
        </p>
        <p>このアプリは学習用です。実際に避難するときは、静岡市の情報を確かめてください。</p>
      </div>
    </footer>
  );
}
