import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { env } from "@classroom/config/env";
import { z } from "zod";

const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MENTOR", "STUDENT"]),
  avatarUrl: z.string().url().nullable().optional()
});

type SessionUser = z.infer<typeof SessionUserSchema>;

type TokenExchange = {
  accessToken: string;
  refreshToken: string;
};

async function fetchSessionUser(accessToken: string): Promise<SessionUser> {
  const response = await fetch(`${env.API_BASE_URL}/auth/session`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Unable to load session: ${response.status}`);
  }
  const json = await response.json();
  const parsed = SessionUserSchema.safeParse(json.user);
  if (!parsed.success) {
    throw new Error("Session payload invalid");
  }
  return parsed.data;
}

async function exchangeGoogleToken(params: { accountId: string; email?: string | null; name?: string | null; avatarUrl?: string | null }): Promise<TokenExchange> {
  if (!params.email) {
    throw new Error("Google account missing email");
  }
  const response = await fetch(`${env.API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: params.email,
      googleId: params.accountId,
      name: params.name ?? params.email,
      avatarUrl: params.avatarUrl ?? undefined
    })
  });
  if (!response.ok) {
    throw new Error("Failed to exchange Google token");
  }
  return response.json();
}

async function exchangeCredentials(params: { email: string; password: string }): Promise<TokenExchange> {
  const response = await fetch(`${env.API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error("Invalid email atau password");
  }
  return response.json();
}

type ExtendedToken = JWT & { user?: SessionUser; accessToken?: string; refreshToken?: string };

type ExtendedSession = Session & { accessToken?: string; refreshToken?: string };

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  session: {
    strategy: "jwt"
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: env.AUTH_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production"
      }
    }
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false
    }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) {
          return null;
        }
        try {
          const tokens = await exchangeCredentials({ email, password });
          const user = await fetchSessionUser(tokens.accessToken);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          } as const;
        } catch (error) {
          console.error(error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        try {
          const tokens = await exchangeGoogleToken({
            accountId: account.providerAccountId,
            email: user.email,
            name: user.name,
            avatarUrl: user.image ?? (user as { avatarUrl?: string | null }).avatarUrl ?? null
          });
          const sessionUser = await fetchSessionUser(tokens.accessToken);
          Object.assign(user, {
            id: sessionUser.id,
            role: sessionUser.role,
            email: sessionUser.email,
            name: sessionUser.name,
            avatarUrl: sessionUser.avatarUrl,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          });
        } catch (error) {
          console.error("Google sign-in failed", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      const nextToken: ExtendedToken = { ...token };
      if (user) {
        nextToken.user = {
          id: user.id as string,
          email: user.email ?? "",
          name: (user.name as string | null) ?? null,
          role: (user as { role?: SessionUser["role"] }).role ?? "STUDENT",
          avatarUrl: (user as { avatarUrl?: string | null }).avatarUrl ?? null
        };
        nextToken.accessToken = (user as { accessToken?: string }).accessToken;
        nextToken.refreshToken = (user as { refreshToken?: string }).refreshToken;
      }
      if (account && account.provider === "google" && !nextToken.accessToken) {
        try {
          const tokens = await exchangeGoogleToken({
            accountId: account.providerAccountId,
            email: nextToken.user?.email,
            name: nextToken.user?.name ?? undefined,
            avatarUrl: nextToken.user?.avatarUrl ?? undefined
          });
          nextToken.accessToken = tokens.accessToken;
          nextToken.refreshToken = tokens.refreshToken;
          const sessionUser = await fetchSessionUser(tokens.accessToken);
          nextToken.user = sessionUser;
        } catch (error) {
          console.error("Failed to hydrate JWT for Google user", error);
          throw error;
        }
      }
      return nextToken;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const nextSession: ExtendedSession = {
        ...session,
        user: token.user,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      };
      return nextSession;
    }
  }
});
