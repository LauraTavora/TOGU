import { jwtVerify, SignJWT } from "jose";
import type { AccessTokenPayload, AccessTokenSigner } from "../ports/access-token-signer";

const ACCESS_TOKEN_TTL = "15m";

export class JoseAccessTokenSigner implements AccessTokenSigner {
  private readonly secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async sign(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_TTL)
      .sign(this.secretKey);
  }

  async verify(token: string): Promise<AccessTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      if (typeof payload.sub !== "string") return null;
      return { userId: payload.sub };
    } catch {
      return null;
    }
  }
}
