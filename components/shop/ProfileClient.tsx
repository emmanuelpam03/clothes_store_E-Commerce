"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  unlinkGoogleAction,
  canLinkGoogleAction,
  resendVerificationCodeAction,
} from "@/app/actions/account.actions";
import { toast } from "sonner";
import SetPasswordModal from "@/app/(shop)/setPasswordModal";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    emailVerified: Date | null;
  };
  hasGoogle: boolean;
  hasPassword: boolean;
};

export default function ProfileClient({
  user,
  hasGoogle,
  hasPassword: initialHasPassword,
}: Props) {
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [isSending, setIsSending] = useState(false);

  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl space-y-10 bg-white rounded-2xl p-8 shadow-sm">
      {/* PROFILE HEADER */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full bg-neutral-200 overflow-hidden">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-neutral-500">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold text-lg">{user.name}</p>
          <p className="text-sm text-neutral-600">{user.email}</p>
        </div>
      </div>

      {/* ACCOUNT ACCESS */}
      <div className="space-y-6">
        <h2 className="text-base font-medium">Account access</h2>

        {/* EMAIL VERIFICATION */}
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Email verification</p>
            <p className="text-xs text-neutral-500">
              {user.emailVerified
                ? "Your email is verified"
                : "Your email is not verified"}
            </p>
          </div>

          {user.emailVerified ? (
            <span className="text-sm text-green-600">Verified</span>
          ) : (
            <button
              disabled={isSending}
              onClick={async () => {
                try {
                  setIsSending(true);
                  await resendVerificationCodeAction();
                  toast.success("Verification code sent");
                  router.push("/verify");
                } catch (err) {
                  if (err instanceof Error) {
                    toast.error(err.message);
                  } else {
                    toast.error("Failed to send verification code");
                  }
                } finally {
                  setIsSending(false);
                }
              }}
              className={`text-sm underline cursor-pointer ${
                isSending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSending ? "Sending..." : "Verify email"}
            </button>
          )}
        </div>

        {/* PASSWORD */}
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Email & Password</p>
            <p className="text-xs text-neutral-500">Sign in using your email</p>
          </div>

          {hasPassword ? (
            <span className="text-sm text-green-600">Enabled</span>
          ) : (
            <button
              onClick={() => setShowSetPassword(true)}
              className="text-sm underline cursor-pointer"
            >
              Set password
            </button>
          )}
        </div>

        {/* GOOGLE */}
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Google account</p>
            <p className="text-xs text-neutral-500">Sign in with Google</p>
          </div>

          <span className="text-sm text-neutral-500">
            {hasGoogle ? "Linked" : "Not linked"}
          </span>
        </div>

        {/* LINK GOOGLE */}
        {!hasGoogle && (
          <button
            onClick={async () => {
              const result = await canLinkGoogleAction();

              if (!result.ok) {
                toast.error(
                  "This Google account is already linked to another account. Please sign in using that account."
                );
                return;
              }

              signIn("google", {
                callbackUrl: "/profile",
              });
            }}
            className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-neutral-50 cursor-pointer"
          >
            Link Google account
          </button>
        )}

        {/* UNLINK GOOGLE */}
        {hasGoogle && hasPassword && (
          <button
            onClick={() => {
              setConfirmed(false);
              setShowUnlinkConfirm(true);
            }}
            className="w-full rounded-lg border border-red-500 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Unlink Google account
          </button>
        )}

        {hasGoogle && !hasPassword && (
          <p className="text-xs text-neutral-500">
            Set a password before unlinking Google.
          </p>
        )}
      </div>

      {/* CONFIRM MODAL */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-5">
            <h3 className="text-base font-semibold">Unlink Google account?</h3>

            <p className="text-sm text-neutral-600">
              You will no longer be able to sign in with Google.
            </p>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>I understand this action cannot be undone.</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>

              <form action={unlinkGoogleAction} className="flex-1">
                <button
                  type="submit"
                  disabled={!confirmed}
                  className={`w-full rounded-lg py-2 text-sm text-white cursor-pointer ${
                    confirmed ? "bg-red-600" : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Unlink
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {showSetPassword && (
        <SetPasswordModal
          onClose={() => setShowSetPassword(false)}
          onPasswordSet={() => setHasPassword(true)}
        />
      )}
    </div>
  );
}
