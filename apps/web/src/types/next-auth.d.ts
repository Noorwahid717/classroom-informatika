import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      name: string | null;
      role?: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "STUDENT" | "GUEST";
      avatarUrl?: string | null;
    };
  }

  interface User {
    role?: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "STUDENT" | "GUEST";
    accessToken?: string;
    refreshToken?: string;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      name: string | null;
      role?: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "STUDENT" | "GUEST";
      avatarUrl?: string | null;
    };
  }
}
