"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changePasswordFirstLogin } from "@/app/actions/account.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function SetPasswordClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Refs to store timeout IDs for cleanup
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePasswordFirstLogin(
        currentPassword,
        newPassword,
      );

      if (result.success) {
        toast.success("Password changed successfully! Redirecting...");
        // Redirect to home or dashboard after a short delay
        successTimeoutRef.current = setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to change password");
        if (result.error?.includes("expired")) {
          // If temp password expired, redirect to login
          errorTimeoutRef.current = setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md bg-white border border-slate-300 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Set Your Password
          </CardTitle>
          <p className="text-sm text-slate-600">
            You must change your temporary password before continuing
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              {/* Current Password */}
              <Field>
                <FieldLabel
                  htmlFor="currentPassword"
                  className="text-slate-700"
                >
                  Current (Temporary) Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter temporary password"
                    className="bg-white text-slate-900 border-2 border-slate-400 focus:border-slate-900 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {errors.currentPassword}
                  </p>
                )}
              </Field>

              {/* New Password */}
              <Field>
                <FieldLabel htmlFor="newPassword" className="text-slate-700">
                  New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="bg-white text-slate-900 border-2 border-slate-400 focus:border-slate-900 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldDescription className="text-slate-600">
                  Must be at least 8 characters long
                </FieldDescription>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword}</p>
                )}
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel
                  htmlFor="confirmPassword"
                  className="text-slate-700"
                >
                  Confirm New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="bg-white text-slate-900 border-2 border-slate-400 focus:border-slate-900 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            <p>Having trouble? Contact an administrator for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
