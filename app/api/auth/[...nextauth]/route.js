import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.role = token.role;
      session.user.isActive = token.isActive;
      session.user.id = token.sub;
      return session;
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
