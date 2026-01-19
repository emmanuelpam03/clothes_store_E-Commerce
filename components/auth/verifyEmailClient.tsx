"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  verifyEmailCodeAction,
  resendVerificationCodeAction,
} from "@/app/actions/account.actions";
import { useRouter } from "next/navigation";

export default function VerifyEmailClient() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify() {
    if (!code) {
      toast.error("Enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmailCodeAction(code);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Email verified successfully");
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);
      await resendVerificationCodeAction();
      toast.success("Verification code resent");
    } catch {
      toast.error("Could not resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center text-lg tracking-widest"
          />

          <Button
            type="submit"
            onClick={handleVerify}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify email"}
          </Button>

          <button onClick={handleResend} disabled={resending || cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
