import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "静岡市の指定緊急避難場所（学習用）",
  description: "国土地理院の指定緊急避難場所データ（静岡市）を地図と一覧で見る、学習用アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
