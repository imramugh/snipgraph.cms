import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snipgraph CMS",
  description: "A draft-first CMS designed for people and agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem('snipgraph-admin-appearance')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.adminAppearance=p}catch(e){}})()` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
