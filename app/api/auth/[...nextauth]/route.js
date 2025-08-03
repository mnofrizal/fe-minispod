import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch("http://localhost:3000/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: data.data.user.role,
              isActive: data.data.user.isActive,
              accessToken: data.data.tokens.accessToken,
              refreshToken: data.data.tokens.refreshToken,
            };
          }

          // Throw error with full response data for better error handling
          throw new Error(JSON.stringify(data));
        } catch (error) {
          console.error("Auth error:", error);
          // If it's already a structured error, re-throw it
          if (error.message.startsWith("{")) {
            throw error;
          }
          // Otherwise, create a generic error structure
          throw new Error(
            JSON.stringify({
              success: false,
              message:
                error.message || "An error occurred during authentication",
              code: "AUTH_ERROR",
            })
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.isActive = user.isActive;

        // Handle Google OAuth
        if (account?.provider === "google") {
          token.googleAccessToken = account.access_token;
          token.role = user.role || "user";
          token.isActive = user.isActive !== undefined ? user.isActive : true;
          token.backendId = user.backendId;
          // Store backend tokens for Google users
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.role = token.role;
      session.user.isActive = token.isActive;
      session.user.id = token.backendId || token.sub; // Use backend ID if available

      if (token.googleAccessToken) {
        session.googleAccessToken = token.googleAccessToken;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        // Send Google ID token to backend
        try {
          const res = await fetch("http://localhost:3000/api/v1/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: account.id_token,
            }),
          });
          console.log(account.id_token);
          if (res.ok) {
            const response = await res.json();
            // Store user data and tokens from backend response
            if (response.success && response.data) {
              user.role = response.data.user?.role || "user";
              user.isActive =
                response.data.user?.isActive !== undefined
                  ? response.data.user.isActive
                  : true;
              user.backendId = response.data.user?.id;
              user.accessToken = response.data.tokens?.accessToken;
              user.refreshToken = response.data.tokens?.refreshToken;
            }
          } else {
            console.error("Backend Google auth failed:", await res.text());
            // If backend sync fails, still allow sign-in with default values
            user.role = "user";
            user.isActive = true;
          }
        } catch (error) {
          console.error("Google sign-in sync error:", error);
          // Allow sign-in even if sync fails, with default values
          user.role = "user";
          user.isActive = true;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
