import NextAuth from "next-auth";
import { authOptions } from "./src/lib/auth-config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth(authOptions);
