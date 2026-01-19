import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "USER" | "ADMIN";
      emailVerified?: Date | null; // ✅ ADD THIS
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: "USER" | "ADMIN";
    emailVerified?: Date | null; // ✅ ADD THIS
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: "USER" | "ADMIN";
    emailVerified?: Date | null; // ✅ ADD THIS
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
