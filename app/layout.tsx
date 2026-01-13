import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import FlashToaster from "@/components/shop/FlashToaster";

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
  const cookieStore = await cookies();
  const flash = cookieStore.get("flash")?.value ?? null;

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
        {/* ONE client boundary */}
        <FlashToaster message={flash} />
        {children}
      </body>
    </html>
  );
}
