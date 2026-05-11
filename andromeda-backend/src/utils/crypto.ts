import crypto from 'crypto';

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto
    .createHash('sha512')
    .update(password.concat(salt))
    .digest('hex');
}

export function verifyPassword(password: string, salt: string, hashedPassword: string): boolean {
  const computed = hashPassword(password, salt);
  return computed === hashedPassword;
}