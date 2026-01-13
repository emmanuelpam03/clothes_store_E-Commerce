"use server";

import { loginSchema } from "@/lib/validators/login.schema";
import { registerSchema } from "@/lib/validators/register.schema";

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

  return {
    email: "",
    error: null,
    success: "Logged in successfully",
    fieldErrors: {},
  };
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


  return {
    name: "",
    email: "",
    error: null,
    success: "Registered successfully",
  };
}

export async function logoutAction() {
  // Add logout logic here
}
