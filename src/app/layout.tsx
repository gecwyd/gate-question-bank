import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import unionLogo from "../../public/union-logo.webp";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "GATE Question Bank",
  description: "A fast, focused way to practise GATE questions from the open question archive.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem("theme"),d=t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}` }} />
      </head>
      <body className="min-h-screen bg-neutral-50 text-foreground selection:bg-blue-100 dark:bg-neutral-950">
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/90 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/90">
          <div className="flex h-14 items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-700">
                <Image src={unionLogo} alt="Logo" className="h-full w-full object-contain p-0.5" priority />
              </div>
              <h1 className="text-sm font-semibold text-neutral-900 dark:text-white">GATE Question Bank</h1>
              <span className="hidden text-[10px] font-medium text-neutral-400 sm:inline">Sathva College Union</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="https://github.com/gecwyd/gate-questions"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 items-center gap-1.5 rounded-md border border-neutral-200 px-2 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">Source</span>
              </a>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
