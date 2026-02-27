"use client";

import { loginAction, googleSignInAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const initialState = {
  email: "",
  error: null as string | null,
  success: null as string | null,
  fieldErrors: {} as Record<string, string>,
};

export function LoginForm(props: React.ComponentProps<typeof Card>) {
  const [state, action, isLoading] = useActionState(loginAction, initialState);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle blocked Google login (email already exists)
  useEffect(() => {
    if (searchParams.get("error") === "email-exists") {
      toast.error(
        "An account with this email already exists. Please sign in using your original method.",
      );

      // Clean the URL so toast doesn’t repeat
      router.replace("/login");
    }
    if (searchParams.get("error") === "account-deactivated") {
      toast.error(
        "Account not found. Please check your credentials or create a new account.",
      );
      router.replace("/login");
    }

    if (searchParams.get("deleted") === "true") {
      toast.success(
        "Your account has been deactivated. You can reactivate it within 90 days by registering again with the same email.",
      );
      router.replace("/login");
    }
  }, [searchParams, router]);

  // 🔵 Handle normal login feedback
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
      router.push("/");
    }
  }, [state, router]);

  return (
    <Card {...props} className="bg-white border border-slate-300 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold text-slate-900">
          Login to your account
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="space-y-6" action={action}>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email" className="text-slate-700">
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                defaultValue={state.email}
                placeholder="pam@example.com"
                className="bg-white text-slate-900 border-2 border-slate-400 focus:border-slate-900"
              />
              {state.fieldErrors?.email && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.email}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-slate-700">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                className="bg-white text-slate-900 border-2 border-slate-400 focus:border-slate-900"
              />
              {state.fieldErrors?.password && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.password}
                </p>
              )}
              <FieldDescription className="text-slate-500">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full text-white border-2 border-slate-300 shadow-lg"
          >
            {isLoading ? "Logging you in..." : "Login"}
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-300" />
          <span className="text-sm text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <form action={googleSignInAction}>
          <Button
            variant="outline"
            type="submit"
            className="w-full border-slate-300 text-slate-900 shadow-lg cursor-pointer"
          >
            Login with Google
          </Button>
        </form>

        <FieldDescription className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-slate-900 underline underline-offset-4"
          >
            Sign up
          </Link>
        </FieldDescription>
      </CardContent>
    </Card>
  );
}
