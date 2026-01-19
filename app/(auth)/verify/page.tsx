import VerifyEmailClient from "@/components/auth/verifyEmailClient";
import { requireUnverifiedUser } from "@/lib/auth/require-unverified";

export default async function VerifyEmailPage() {
  await requireUnverifiedUser();

  return <VerifyEmailClient />;
}
