import '../globals.css'
import { Navbar } from "@/components/Navbar/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  <Navbar />
  {children}
  </>;
}
