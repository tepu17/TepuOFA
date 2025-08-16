import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Layout({ children }) {
  useEffect(()=>{
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  },[]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a3d62" />
        <link rel="icon" href="/icon-192.png" />
      </Head>
      <header className="border-b border-neutral-800">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold">Open Fantasy Assistant</Link>
          <nav className="flex gap-4">
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/players" className="hover:underline">Players</Link>
            <Link href="/myteam" className="hover:underline">Rate My Team</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6 flex-1">{children}</main>
      <footer className="py-6 text-center text-sm text-neutral-400">
        Built with public Fantasy Premier League data. Not affiliated with the Premier League.
      </footer>
    </div>
  );
}
