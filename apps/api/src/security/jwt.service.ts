import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@api/config/env";

type SignablePayload = Record<string, unknown>;

type SignOptions = {
  expiresIn?: string | number;
};

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode<T = unknown>(value: string): T {
  const decoded = Buffer.from(value, "base64url").toString("utf8");
  return JSON.parse(decoded) as T;
}

function parseExpiry(expiresIn: string | number | undefined): number | undefined {
  if (!expiresIn) return undefined;
  if (typeof expiresIn === "number") {
    return expiresIn;
  }
  const match = /^([0-9]+)([smhd])$/.exec(expiresIn.trim());
  if (!match) {
    throw new Error(`Unsupported expiresIn format: ${expiresIn}`);
  }
  const [, amount, unit] = match;
  if (!amount || !unit) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }
  const value = Number.parseInt(amount, 10);
  const multiplier: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24
  };
  if (!(unit in multiplier)) {
    throw new Error(`Invalid expiresIn unit: ${unit}`);
  }
  const factor = multiplier[unit];
  if (typeof factor !== 'number') {
    throw new Error(`Multiplier for unit '${unit}' is undefined`);
  }
  return value * factor;
}

@Injectable()
export class JwtService {
  private readonly secret = env.JWT_SECRET;

  sign(payload: SignablePayload, options: SignOptions = {}) {
    const header = { alg: "HS256", typ: "JWT" };
    const body: SignablePayload = { ...payload };
    const ttl = parseExpiry(options.expiresIn);
    if (ttl) {
      body.exp = Math.floor(Date.now() / 1000) + ttl;
    }
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(body));
    const signature = this.signSegment(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify<T = SignablePayload>(token: string): T {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedException("Malformed token");
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    if (!signature) {
      throw new UnauthorizedException("Missing signature");
    }
    if (!encodedPayload) {
      throw new UnauthorizedException("Missing payload");
    }
    const expectedSignature = this.signSegment(`${encodedHeader}.${encodedPayload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new UnauthorizedException("Invalid signature");
    }
    const payload = base64UrlDecode<T>(encodedPayload);
    const expiration = (payload as Record<string, unknown>).exp;
    if (typeof expiration === "number" && expiration < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException("Token expired");
    }
    return payload;
  }

  private signSegment(value: string) {
    return createHmac("sha256", this.secret).update(value).digest("base64url");
  }
}
