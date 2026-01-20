"use server";

import { loginSchema } from "@/lib/validators/login.schema";
import { registerSchema } from "@/lib/validators/register.schema";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/email";

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
  _prev: LoginState,
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

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result) {
      return {
        email,
        error: "Invalid email or password",
        success: null,
        fieldErrors: {},
      };
    }

    return {
      email: "",
      error: null,
      success: "Logged in successfully",
      fieldErrors: {},
    };
  } catch {
    // Auth.js throws CredentialsSignin on wrong password
    return {
      email,
      error: "Invalid email or password",
      success: null,
      fieldErrors: {},
    };
  }
}


export async function registerAction(
  _prev: RegisterState,
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

  const user = await prisma.user.create({
    data: {
      name: rawData.name,
      email: rawData.email,
      password: hashedPassword,
      emailVerified: null,
    },
  });

  // 🔒 ensure email exists
  if (!user.email) {
    return {
      name: "",
      email: "",
      error: "Invalid email",
      success: null,
      fieldErrors: {},
    };
  }

  // create token
  const token = await createEmailVerificationToken(user.id);

  // send email
  await sendVerificationEmail(user.email, token);

  return {
    name: "",
    email: "",
    error: null,
    success: "Account created successfully",
    fieldErrors: {},
  };
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
