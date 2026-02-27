import VerifyEmailClient from "@/components/auth/verifyEmailClient";

export default async function VerifyEmailPage() {
  // Auth checks handled by proxy.ts - it redirects:
  // - Unverified users TO /verify (from other pages)
  // - Verified users AWAY from /verify (to home)
  return <VerifyEmailClient />;
}
