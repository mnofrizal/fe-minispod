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
          return null;
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
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
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

      // Validate token against database on each request
      if (token.accessToken) {
        try {
          const res = await fetch("http://localhost:3000/api/v1/auth/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            // Token is invalid, mark as invalid
            token.isValid = false;
            return token;
          }

          const data = await res.json();
          if (!data.success || !data.data) {
            // User doesn't exist in database, mark as invalid
            token.isValid = false;
            return token;
          }

          // Check if user is inactive
          if (!data.data.isActive) {
            // User is inactive, mark as invalid
            token.isValid = false;
            return token;
          }

          // Update token with fresh user data and mark as valid
          token.role = data.data.role;
          token.isActive = data.data.isActive;
          token.isValid = true;
        } catch (error) {
          console.error("Token validation error:", error);
          // On error, mark as invalid
          token.isValid = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is invalid, return null session
      if (!token || token.isValid === false) {
        return null;
      }

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
