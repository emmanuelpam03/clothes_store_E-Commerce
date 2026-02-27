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

  // logger:{
  //   error(code){
  //     if(code === "CredentialsSignin")return;
  //   }
  // },

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

        // Reject if account is deactivated
        if (!user.active) {
          return null;
        }

        // Reject if email is not verified
        if (!user.emailVerified) {
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
          // Check if this Google account is already linked to any user
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId!,
              },
            },
          });

          if (existingAccount) {
            // Allow sign-in, as the account is linked
            return true;
          }

          // If not linked, check if email is taken by a user
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, active: true },
          });

          if (existingUser) {
            // If account exists and is deactivated, block login
            if (!existingUser.active) {
              return "/login?error=account-deactivated";
            }
            return "/login?error=email-exists";
          }
        }

        // This runs ONLY when:
        // - Google sign-in is allowed
        // - No takeover was detected
        // - Account is safe to trust
        //   if (account?.provider === "google") {
        //     await prisma.user.update({
        //       where: { email: user.email! },
        //       data: { emailVerified: new Date() },
        //     });
        //   }
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
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;

        if (token.sub) {
          const hasGoogleAccount = await prisma.account.findFirst({
            where: {
              userId: token.sub,
              provider: "google",
            },
            select: { id: true },
          });

          if (hasGoogleAccount) {
            await prisma.user.updateMany({
              where: {
                id: token.sub,
                emailVerified: null,
              },
              data: {
                emailVerified: new Date(),
              },
            });
          }
        }

        return token;
      }

      // Validate that user still exists and is active
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { id: true, active: true },
          });

          // Invalidate session if user doesn't exist or is deactivated
          if (!dbUser || !dbUser.active) {
            return null;
          }
        } catch (error) {
          // If database check fails, continue with existing token
          // This prevents sessions from breaking due to transient errors
          console.error("Failed to validate user in JWT callback:", error);
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
      session.user.emailVerified = token.emailVerified as Date | null;

      return session;
    },
  },
});
