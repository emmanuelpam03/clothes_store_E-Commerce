// import { Toaster } from 'sonner';
import '../globals.css'
import { Navbar } from "@/components/Layout/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  <Navbar />
  {children}
  {/* <Toaster /> */}
  </>;
}
