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
  formData: FormData,
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
  formData: FormData,
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
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: rawData.email },
  });

  if (existingUser) {
    // If user exists and is deactivated, prepare restoration but require verification
    if (!existingUser.active) {
      const hashedPassword = await bcrypt.hash(rawData.password, 10);

      // Update password but keep account inactive until email is verified
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: rawData.name,
          password: hashedPassword,
          deletedAt: null,
          emailVerified: null, // Must verify email to restore
          // active stays false until verification
        },
      });

      // Send verification email to prove ownership
      const code = await createEmailVerificationToken(existingUser.id);
      await sendVerificationEmail(rawData.email, code);

      return {
        name: "",
        email: "",
        error: null,
        success:
          "Account created successfully! Please check your email for verification code.",
        fieldErrors: {},
      };
    }

    // User exists and is active
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

  // Create token and send verification email
  const code = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, code);

  return {
    name: "",
    email: "",
    error: null,
    success:
      "Account created successfully! Please check your email for verification code.",
    fieldErrors: {},
  };
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
