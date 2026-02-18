import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import type { Context } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';
import type { SessionData } from '@maple/shared';

const SESSION_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const getAllowedEmails = () => {
  const emails = process.env.ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];
  return emails;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const isEmailAllowed = (email: string): boolean => {
  const allowedEmails = getAllowedEmails();
  console.log(`Checking email: "${email}"`);
  console.log(`Allowed emails: [${allowedEmails.map(e => `"${e}"`).join(', ')}]`);
  const isAllowed = allowedEmails.includes(email);
  console.log(`Email allowed: ${isAllowed}`);
  return isAllowed;
};

export const createSessionToken = (sessionData: SessionData): string => {
  const payload = JSON.stringify(sessionData);
  const signature = createHash('sha256')
    .update(payload + SESSION_SECRET)
    .digest('hex');
  
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
};

export const verifySessionToken = (token: string): SessionData | null => {
  try {
    const [payloadBase64, signature] = token.split('.');
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    
    const expectedSignature = createHash('sha256')
      .update(payload + SESSION_SECRET)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const setSessionCookie = (c: Context, sessionData: SessionData) => {
  const token = createSessionToken(sessionData);
  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const getSessionFromCookie = (c: Context): SessionData | null => {
  const sessionToken = getCookie(c, 'session');
  if (!sessionToken) return null;
  
  return verifySessionToken(sessionToken);
};

export const clearSessionCookie = (c: Context) => {
  setCookie(c, 'session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });
};

export const generateInviteCode = (): string => {
  return randomBytes(8).toString('hex').toUpperCase();
};