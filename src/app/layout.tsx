import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GATE Question Bank",
  description: "A fast, focused way to practise GATE questions from the open question archive.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
