import SetPasswordClient from "@/components/auth/SetPasswordClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SetPasswordPage() {
  const session = await auth();

  // Must be logged in
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user to check if password change is required
  // This could also be done in the client component, but doing it here
  // ensures we have the data on page load
  return <SetPasswordClient />;
}
