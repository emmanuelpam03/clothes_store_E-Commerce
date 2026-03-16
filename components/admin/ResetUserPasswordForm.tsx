"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminSetUserPasswordAdmin } from "@/app/actions/admin.actions";

type Props = {
  userId: string;
};

export default function ResetUserPasswordForm({ userId }: Props) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (isSaving) return;

        if (!newPassword) {
          toast.error("New password is required");
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        setIsSaving(true);
        try {
          await adminSetUserPasswordAdmin(userId, newPassword);
          toast.success("Password reset. User must change it on next login.");
          setNewPassword("");
          setConfirmPassword("");
          router.refresh();
        } catch (_err) {
          toast.error("Failed to reset password");
        } finally {
          setIsSaving(false);
        }
      }}
    >
      <label htmlFor="new-password" className="sr-only">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isSaving}
      />
      <label htmlFor="confirm-new-password" className="sr-only">
        Confirm new password
      </label>
      <input
        id="confirm-new-password"
        type="password"
        placeholder="Confirm new password"
        autoComplete="new-password"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isSaving}
      />
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Reset password"}
      </button>

      <p className="text-xs text-slate-600">
        This will sign the user out and require a password change on next login.
      </p>
    </form>
  );
}
