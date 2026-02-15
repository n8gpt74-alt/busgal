/**
 * Telegram WebApp Authentication
 * Server-side verification of initData using HMAC-SHA256
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Telegram initData verification result
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface VerifiedInitData {
  user: TelegramUser;
  query_id: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram initData from WebApp
 * @param initData - Raw initData string from Telegram WebApp
 * @param botToken - Your bot token from @BotFather
 * @returns Verified data or null if invalid
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): VerifiedInitData | null {
  try {
    // Parse initData
    const params = new URLSearchParams(initData);
    
    const hash = params.get('hash');
    if (!hash) return null;
    
    // Remove hash from data check
    params.delete('hash');
    
    // Sort keys alphabetically
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create HMAC-SHA256
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    const hmac = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Timing-safe comparison
    const hashBuffer = Buffer.from(hash, 'hex');
    const hmacBuffer = Buffer.from(hmac, 'hex');
    
    if (hashBuffer.length !== hmacBuffer.length) return null;
    if (!timingSafeEqual(hashBuffer, hmacBuffer)) return null;
    
    // Parse user data
    const userData = params.get('user');
    if (!userData) return null;
    
    const user: TelegramUser = JSON.parse(userData);
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const queryId = params.get('query_id') || '';
    
    // Check if not too old (max 24 hours)
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;
    
    return {
      user,
      query_id: queryId,
      auth_date: authDate,
      hash,
    };
  } catch {
    return null;
  }
}

/**
 * Extract telegram_id from initData for database lookup
 */
export function extractTelegramId(initData: string): number | null {
  try {
    const params = new URLSearchParams(initData);
    const userData = params.get('user');
    if (!userData) return null;
    
    const user: TelegramUser = JSON.parse(userData);
    return user.id;
  } catch {
    return null;
  }
}

/**
 * Create session token from Telegram user
 */
export function createSessionToken(userId: number, secret: string): string {
  const crypto = require('crypto');
  const payload = `${userId}:${Date.now()}`;
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Validate session token
 */
export function validateSessionToken(
  token: string,
  userId: number,
  secret: string
): boolean {
  // Token format: userId:timestamp:hash
  const crypto = require('crypto');
  const [id, timestamp, expectedHash] = token.split(':');
  
  if (parseInt(id, 10) !== userId) return false;
  
  // Check if token is not too old (7 days)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (tokenAge > 7 * 24 * 60 * 60 * 1000) return false;
  
  const payload = `${id}:${timestamp}`;
  const actualHash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(actualHash)
  );
}
