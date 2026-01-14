"use server";

import { loginSchema } from "@/lib/validators/login.schema";
import { registerSchema } from "@/lib/validators/register.schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

type RegisterState = {
  name: string;
  email: string;
  error: string | null;
  success: string | null;
  fieldErrors?: Record<string, string>;
};

type LoginState = {
  email: string;
  error: string | null;
  success: string | null;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      email: rawData.email,
      error: "Please ensure all inputs are valid",
      success: null,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ),
    };
  }

  const cookieStore = await cookies();

  cookieStore.set("flash", "Welcome back!", {
    path: "/",
  });

  redirect("/");

  // return {
  //   email: "",
  //   error: null,
  //   success: "Logged in successfully",
  //   fieldErrors: {},
  // };
}

export async function registerAction(
  previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const rawData = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      name: rawData.name,
      email: rawData.email,
      error: "Please ensure all inputs are valid",
      success: null,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ),
    };
  }

  console.log(rawData.name, rawData.email);

  const cookieStore = await cookies();

  cookieStore.set("flash", "Account created successfully", {
    path: "/",
  });

  redirect("/login");

  // return {
  //   name: "",
  //   email: "",
  //   error: null,
  //   success: "Registered successfully",
  // };
}

export async function logoutAction() {
  // Add logout logic here
}

export async function googleSignInAction() {
  await signIn("google", {
    callbackUrl: "/",
    redirectTo: "/",
  });
}

export async function signOutAction() {
  console.log("Signing out...");

  await signOut({
    redirectTo: "/login",
  });
}
