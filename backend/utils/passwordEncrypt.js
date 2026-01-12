import crypto from 'crypto';

const ALGO = 'aes-256-cbc';
// Expect a 32-byte key in env var PASSWORD_ENC_KEY
const KEY = (process.env.PASSWORD_ENC_KEY || 'dev-password-encryption-key-123456').padEnd(32).slice(0, 32);

export function encryptText(plain) {
  if (!plain) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);
  let encrypted = cipher.update(String(plain), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

export function decryptText(payload) {
  if (!payload) return null;
  try {
    const [ivB64, encrypted] = payload.split(':');
    if (!ivB64 || !encrypted) return null;
    const iv = Buffer.from(ivB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('Decrypt failed', err.message);
    return null;
  }
}
