import { auth } from "@/../auth";
import type { Session } from "next-auth";

// Inline Role enum from prisma/schema.prisma
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MENTOR = "MENTOR",
  STUDENT = "STUDENT"
}
import { authOptions } from "@/lib/auth-config";

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
      return Role.MENTOR;
    }
  return role;
}

export function hasPermission(role: AppRole | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return false;
  }
  const allowed = ROLE_PERMISSIONS[normalized];
  if (!allowed) return false;
  if (allowed === "*") {
    return true;
  }
  return (allowed as Permission[]).includes(permission);
}

export function assertPermission(sess: Session | null, permission: Permission): asserts sess is Session & {
  user: Session["user"] & { role: Role };
} {
  if (!sess || !sess.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  if (!hasPermission(sess.user.role as AppRole, permission)) {
    throw new AuthorizationError("Forbidden", 403);
  }
}

export function assertRole(sess: Session | null, roles: AppRole[]): asserts sess is Session & {
  user: Session["user"] & { role: Role };
} {
  if (!sess || !sess.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  const normalized = normalizeRole(sess.user.role as AppRole);
  if (!normalized || !roles.map(normalizeRole).includes(normalized)) {
    throw new AuthorizationError("Forbidden", 403);
  }
}

export async function requireSession(): Promise<Session & { user: Session["user"] & { role: Role } }> {
  const sess = await auth();
  if (!sess || !sess.user) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  const normalized = normalizeRole(sess.user.role as AppRole);
  if (!normalized) {
    throw new AuthorizationError("Unauthorized", 401);
  }
  sess.user.role = normalized;
  return sess as Session & { user: Session["user"] & { role: Role } };
}
