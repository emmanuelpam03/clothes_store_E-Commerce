"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  unlinkGoogleAction,
  canLinkGoogleAction,
  resendVerificationCodeAction,
  deactivateAccountAction,
  deleteAccountPermanently,
  changePasswordAction,
  updateProfileAction,
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
  const [profileName, setProfileName] = useState(user.name ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<"deactivate" | "permanent">(
    "deactivate",
  );
  const [confirmed, setConfirmed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [isSending, setIsSending] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl space-y-10 bg-white rounded-2xl p-8 shadow-sm">
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
          <p className="font-semibold text-lg">
            {profileName.trim() || user.name || "No name"}
          </p>
          <p className="text-sm text-neutral-600">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-medium">Profile</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (isSavingProfile) return;

            setIsSavingProfile(true);
            try {
              const result = await updateProfileAction(profileName);
              if (result.success) {
                toast.success("Profile updated");
                router.refresh();
              } else {
                toast.error(result.error || "Failed to update profile");
              }
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Failed to update profile",
              );
            } finally {
              setIsSavingProfile(false);
            }
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="profileName">
              Name
            </label>
            <input
              id="profileName"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Your name"
              disabled={isSavingProfile}
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-base font-medium">Account access</h2>

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
            <button
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setShowChangePassword(true);
              }}
              className="text-sm underline cursor-pointer"
            >
              Change password
            </button>
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
                  "This Google account is already linked to another account. Please sign in using that account.",
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

      {/* DANGER ZONE */}
      <div className="space-y-4 pt-4 border-t border-red-200">
        <h2 className="text-base font-medium text-red-600">Danger Zone</h2>

        <div className="space-y-3">
          {/* DEACTIVATE ACCOUNT */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">
              Deactivate Account
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Temporarily disable your account. You can reactivate within 90
              days by logging in again.
            </p>
          </div>

          <button
            onClick={() => {
              setDeleteType("deactivate");
              setDeleteConfirmed(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full rounded-lg border border-amber-500 bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700 cursor-pointer"
          >
            Deactivate Account
          </button>

          {/* PERMANENTLY DELETE ACCOUNT */}
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-900">
              Permanently Delete Account
            </p>
            <p className="text-xs text-red-700 mt-1">
              Immediately delete all your personal data. This action cannot be
              undone.
            </p>
          </div>

          <button
            onClick={() => {
              setDeleteType("permanent");
              setDeleteConfirmed(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full rounded-lg border border-red-500 bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
          >
            Permanently Delete Account
          </button>
        </div>
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

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-5">
            {deleteType === "deactivate" ? (
              <>
                <h3 className="text-base font-semibold text-amber-600">
                  Deactivate Account?
                </h3>

                <div className="space-y-3 text-sm text-neutral-600">
                  <p>
                    Your account will be deactivated immediately and you&apos;ll
                    be logged out.
                  </p>
                  <p>
                    <strong className="text-neutral-900">Within 90 days</strong>
                    , you can reactivate by logging in with your email and
                    password.
                  </p>
                  <p>
                    <strong className="text-neutral-900">After 90 days</strong>,
                    your account will be permanently deleted if not reactivated.
                  </p>
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  />
                  <span>
                    I understand my account can be reactivated within 90 days.
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <form action={deactivateAccountAction} className="flex-1">
                    <button
                      type="submit"
                      disabled={!deleteConfirmed}
                      className={`w-full rounded-lg py-2 text-sm text-white cursor-pointer ${
                        deleteConfirmed
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-amber-300 cursor-not-allowed"
                      }`}
                    >
                      Deactivate Account
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-red-600">
                  Permanently Delete Account?
                </h3>

                <div className="space-y-3 text-sm text-neutral-600">
                  <p className="font-semibold text-red-600">
                    ⚠️ This action cannot be undone!
                  </p>
                  <p>
                    All your personal data will be{" "}
                    <strong>immediately and permanently deleted</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your email, name, and profile information</li>
                    <li>Your cart and favorites</li>
                    <li>Personal data in order history</li>
                    <li>All linked accounts (Google, etc.)</li>
                  </ul>
                  <p className="text-xs">
                    This account cannot be recovered. Your email will be freed
                    and can be used to create a new account.
                  </p>
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  />
                  <span>
                    I understand this will permanently delete all my data and
                    cannot be undone.
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <form action={deleteAccountPermanently} className="flex-1">
                    <button
                      type="submit"
                      disabled={!deleteConfirmed}
                      className={`w-full rounded-lg py-2 text-sm text-white cursor-pointer ${
                        deleteConfirmed
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-red-300 cursor-not-allowed"
                      }`}
                    >
                      Permanently Delete
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showSetPassword && (
        <SetPasswordModal
          onClose={() => setShowSetPassword(false)}
          onPasswordSet={() => setHasPassword(true)}
        />
      )}

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-5">
            <h3 className="text-base font-semibold">Change password</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isChangingPassword) return;

                setIsChangingPassword(true);
                try {
                  const result = await changePasswordAction(
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                  );

                  if (result.success) {
                    toast.success("Password updated");
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  } else {
                    toast.error(result.error || "Failed to change password");
                  }
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to change password",
                  );
                } finally {
                  setIsChangingPassword(false);
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
              />

              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
              />

              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Confirm new password"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isChangingPassword}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50"
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 rounded-lg bg-black py-2 text-sm text-white disabled:opacity-50"
                >
                  {isChangingPassword ? "Saving..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
