"use client";

import { registerAction } from "@/app/actions/auth.actions";
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
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState = {
  name: "",
  email: "",
  error: null,
  success: null,
  fieldErrors: {},
};

export function SignupForm(props: React.ComponentProps<typeof Card>) {
  const [state, action, isLoading] = useActionState(
    registerAction,
    initialState
  );


  return (
    <Card {...props} className="bg-white border border-slate-300 shadow-lg">
      <CardHeader className="space-y-1 justify-center">
        <CardTitle className="text-2xl font-semibold text-slate-900">
          Create an account
        </CardTitle>
        {/* <p className="text-sm text-slate-600">
          Enter your information to get started.
        </p> */}
      </CardHeader>

      <CardContent>
        <form className="space-y-6" action={action}>
          <FieldGroup className="space-y-2">
            <Field>
              <FieldLabel className="text-slate-700" htmlFor="name">
                Full Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                name="name"
                defaultValue={state.name ?? ""}
                placeholder="Emmanuel Pam"
                className="bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-400 focus:border focus:border-slate-900 focus:ring-slate-900"
              />
              {state.fieldErrors?.name && (
                <p className="text-sm text-red-600">{state.fieldErrors.name}</p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-slate-700" htmlFor="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                defaultValue={state.email ?? ""}
                placeholder="pam@example.com"
                className="bg-white text-slate-900 placeholder:text-slate-400 border-2 border-slate-400 focus:border focus:border-slate-900 focus:ring-slate-900"
              />
              {state.fieldErrors?.email && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.email}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-slate-700" htmlFor="password">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                className="bg-white text-slate-900 border-2 border-slate-400 focus:border focus:border-slate-900 focus:ring-slate-900"
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

            <Field>
              <FieldLabel className="text-slate-700" htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                name="confirmPassword"
                className="bg-white text-slate-900 border-2 border-slate-400 focus:border focus:border-slate-900 focus:ring-slate-900"
              />
              {state.fieldErrors?.confirmPassword && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.confirmPassword}
                </p>
              )}
              <FieldDescription className="text-slate-500">
                Please confirm your password.
              </FieldDescription>
            </Field>
          </FieldGroup>

          {/* Actions */}
          <div className="space-y-3 border">
            <Button
              type="submit"
              className="w-full text-white border-2 border-slate-300 shadow-lg cursor-pointer"
            >
              {isLoading ? "Signing you up..." : "Create Account"}
            </Button>
            {state.error && <p className="text-red-600">{state.error}</p>}

            <Link href="/">
              <Button
                variant="outline"
                type="button"
                className="w-full border-slate-300 text-slate-900 shadow-lg cursor-pointer"
              >
                Sign up with Google
              </Button>
            </Link>
          </div>

          <FieldDescription className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 underline underline-offset-4"
            >
              Sign in
            </Link>
          </FieldDescription>
        </form>
      </CardContent>
    </Card>
  );
}
