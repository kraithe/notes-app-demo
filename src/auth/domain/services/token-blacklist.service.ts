import { Injectable } from '@nestjs/common';

/**
 * In-memory token blacklist. Revoked JWTs are stored here until their natural
 * expiry time so the JWT strategy can reject them on every request.
 * Entries are pruned automatically when their TTL elapses.
 */
@Injectable()
export class TokenBlacklistService {
  private readonly blacklist = new Map<string, ReturnType<typeof setTimeout>>();

  revokeToken(jti: string, expiresAt: number): void {
    const ttlMs = expiresAt * 1000 - Date.now();
    if (ttlMs <= 0) {
      return;
    }
    const timer = setTimeout(() => this.blacklist.delete(jti), ttlMs);
    this.blacklist.set(jti, timer);
  }

  isRevoked(jti: string): boolean {
    return this.blacklist.has(jti);
  }
}
