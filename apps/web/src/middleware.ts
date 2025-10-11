import { NextResponse } from "next/server";
import { auth } from "@/auth";

const TEACHER_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "MENTOR"]);

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role ?? null;

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/dashboard/teacher") && (!role || !TEACHER_ROLES.has(role))) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname === "/" && session && !searchParams.has("callbackUrl")) {
    if (role && TEACHER_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
    }
    if (role === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard/student", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"]
};
