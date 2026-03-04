import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicChain | Blockchain Local Governance",
  description: "A blockchain-based privacy-preserving reporting framework for local governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 bg-background text-foreground animate-in fade-in duration-500">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
