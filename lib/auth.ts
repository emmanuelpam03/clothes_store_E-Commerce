import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Main NextAuth configuration
 * - Uses Prisma adapter for DB persistence
 * - Uses JWT strategy so sessions survive DB user deletion checks
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as never),

  /**
   * JWT sessions are required here because:
   * - We want fine-grained control over session invalidation
   * - We want to kill sessions if a user is deleted from the DB
   */
  session: {
    strategy: "jwt",
  },

  providers: [
    // ======================================================
    // GOOGLE OAUTH PROVIDER
    // ======================================================
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,

      /**
       * ⚠️ IMPORTANT:
       * This allows linking OAuth accounts to existing users
       * *based on email address*.
       *
       * This is REQUIRED to support:
       * - Explicit account linking from the profile page
       *
       * 🚨 HOWEVER:
       * This MUST be guarded in the `signIn` callback below
       * to prevent account takeover during login.
       */
      allowDangerousEmailAccountLinking: true,

      /**
       * Normalize Google profile into our User shape
       * This is what gets stored in the database on first link
       */
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),

    // ======================================================
    // EMAIL / PASSWORD (CREDENTIALS) PROVIDER
    // ======================================================
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      /**
       * Runs ONLY for credentials login.
       * This is where password verification happens.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Reject if user does not exist or has no password set
        if (!user || !user.password) {
          return null;
        }

        // Compare password hash
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return null;
        }

        // Successful login → return user payload
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * signIn callback
     *
     * This is the CRITICAL SECURITY GUARD.
     *
     * It prevents Google OAuth from silently linking itself
     * to an existing credentials account during login.
     *
     * Rules enforced here:
     * - Logged OUT user + Google login + email exists → ❌ BLOCK
     * - Logged IN user linking Google from profile → ✅ ALLOW
     */
    async signIn({ user, account }) {
      // Only apply this logic to Google OAuth
      if (account?.provider === "google") {
        const session = await auth();

        /**
         * If there is NO active session, this is a login attempt,
         * not an explicit account-linking action.
         */
        if (!session) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true },
          });

          /**
           * If a user with this email already exists,
           * block OAuth login and redirect with an error.
           *
           * The UI will handle this and show a toast.
           */
          if (existingUser) {
            return "/login?error=email-exists";
          }
        }
      }

      // Allow sign-in in all other cases
      return true;
    },

    /**
     * jwt callback
     *
     * Runs on:
     * - initial login
     * - every subsequent request
     *
     * Used here to:
     * - attach user data to the token
     * - invalidate sessions if the user is deleted
     */
    async jwt({ token, user }) {
      /**
       * First login (credentials OR OAuth)
       * Attach user data to the token
       */
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
        return token;
      }

      /**
       * Session hardening:
       * If the user no longer exists in the database,
       * invalidate the JWT → forces logout everywhere.
       */
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true },
        });

        if (!dbUser) {
          return null;
        }
      }

      return token;
    },

    /**
     * session callback
     *
     * Controls what is exposed to the client.
     * We explicitly map token → session.user
     */
    async session({ session, token }) {
      // If token is invalid, return session as-is
      if (!token || !session.user) return session;

      session.user.id = token.sub as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string | null;
      session.user.role = token.role as "USER" | "ADMIN";

      return session;
    },
  },
});
