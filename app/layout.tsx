import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "XIV",
  description: "Fashion & Design",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="no-scrollbar overflow-y-scroll">
      <body className={`${inter.variable} ${interTight.variable} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              success: "bg-emerald-600 text-white border border-emerald-700",
              error: "bg-red-600 text-white border border-red-700",
              warning: "bg-yellow-500 text-black border border-yellow-600",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
