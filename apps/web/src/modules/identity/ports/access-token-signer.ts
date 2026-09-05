export interface AccessTokenPayload {
  userId: string;
}

export interface AccessTokenSigner {
  sign(payload: AccessTokenPayload): Promise<string>;
  verify(token: string): Promise<AccessTokenPayload | null>;
}
