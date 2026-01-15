"use server";

import { loginSchema } from "@/lib/validators/login.schema";
import { registerSchema } from "@/lib/validators/register.schema";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      email,
      error: "Invalid input",
      success: null,
      fieldErrors: {},
    };
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  // THIS IS THE KEY CHECK
  if (!result || result.error) {
    return {
      email,
      error: "Invalid email or password",
      success: null,
      fieldErrors: {},
    };
  }

  revalidatePath("/");

  redirect("/");
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

  // PREVENT DUPLICATE EMAILS
  const existingUser = await prisma.user.findUnique({
    where: { email: rawData.email },
  });

  if (existingUser) {
    return {
      name: rawData.name,
      email: rawData.email,
      error: "An account with this email already exists",
      success: null,
      fieldErrors: {},
    };
  }

  const hashedPassword = await bcrypt.hash(rawData.password, 10);

  await prisma.user.create({
    data: {
      name: rawData.name,
      email: rawData.email,
      password: hashedPassword,
    },
  });

  // // 🔴 AUTO LOGIN
  // await signIn("credentials", {
  //   email: rawData.email,
  //   password: rawData.password,
  //   redirect: false,
  // });
  // redirect("/")

  redirect("/login");
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

  await signOut({
    redirectTo: "/",
  });
}
