import type { Session } from "next-auth";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export type AppRole = Role | "TEACHER";

export type Permission =
  | "class:read"
  | "class:manage"
  | "assignment:read"
  | "assignment:manage"
  | "submission:create"
  | "submission:read"
  | "submission:grade"
  | "portfolio:review"
  | "user:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: [
    "class:manage",
    "assignment:manage",
    "submission:grade",
    "portfolio:review",
    "user:manage",
    "submission:read",
    "assignment:read",
    "class:read"
  ],
  MENTOR: [
    "class:read",
    "assignment:read",
    "assignment:manage",
    "submission:read",
    "submission:grade",
    "portfolio:review"
  ],
  STUDENT: [
    "class:read",
    "assignment:read",
    "submission:create",
    "submission:read"
  ]
};

export class AuthorizationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AuthorizationError";
  }
}

function normalizeRole(role?: AppRole | null): Role | null {
  if (!role) {
    return null;
  }
  if (role === "TEACHER") {
    return "MENTOR";
  }
  return role;
}

export function hasPermission(role: AppRole | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return false;
  }
  const allowed = ROLE_PERMISSIONS[normalized];
  if (!allowed) {
    return false;
  }
  if (allowed === "*") {
    return true;
  }
  return allowed.includes(permission);
}

export function assertPermission(session: Session | null, permission: Permission): asserts session is Session & {
  user: Session["user"] & { role: Role };
} {
  if (!session || !session.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  if (!hasPermission(session.user.role as AppRole, permission)) {
    throw new AuthorizationError("Forbidden", 403);
  }
}

export function assertRole(session: Session | null, roles: AppRole[]): asserts session is Session & {
  user: Session["user"] & { role: Role };
} {
  if (!session || !session.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  const normalized = normalizeRole(session.user.role as AppRole);
  if (!normalized || !roles.map(normalizeRole).includes(normalized)) {
    throw new AuthorizationError("Forbidden", 403);
  }
}

export async function requireSession(): Promise<Session & { user: Session["user"] & { role: Role } }> {
  const session = await auth();
  if (!session || !session.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  const normalized = normalizeRole(session.user.role as AppRole);
  if (!normalized) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  session.user.role = normalized;
  return session as Session & { user: Session["user"] & { role: Role } };
}
