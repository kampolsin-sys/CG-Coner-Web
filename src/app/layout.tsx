import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CG Corner Knowledge Sharing",
  description: "Knowledge Sharing from CG Corner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <main className="min-h-screen bg-slate-50 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
