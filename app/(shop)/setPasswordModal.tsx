"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { setPasswordAction } from "../actions/account.actions";

type Props = {
  onClose: () => void;
};

const initialState = {
  error: null as string | null,
  success: false,
};

export default function SetPasswordModal({ onClose }: Props) {
  const [state, action, isPending] = useActionState(
    setPasswordAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Password set successfully");
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-5">
        <h3 className="text-base font-semibold">Set a password</h3>

        <form action={action} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-black py-2 text-sm text-white disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Set password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
