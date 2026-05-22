const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_CODE_REGEX = /^[A-Za-z0-9]{6}$/;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'text/plain',
]);

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email?.trim()) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(email.trim())) return { valid: false, error: 'Please enter a valid email address' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/\d/.test(password)) return { valid: false, error: 'Password must contain at least 1 number' };
  return { valid: true };
}

export function validateRequired(fields: Record<string, unknown>): { valid: boolean; errors: Record<string, string> } {
  const errors = Object.entries(fields).reduce<Record<string, string>>((acc, [fieldName, value]) => {
    if (value === null || value === undefined || String(value).trim().length === 0) {
      acc[fieldName] = `${fieldName} is required`;
    }
    return acc;
  }, {});
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFileType(mimeType: string): { valid: boolean; error?: string } {
  if (ALLOWED_MIME_TYPES.has(mimeType)) return { valid: true };
  return { valid: false, error: 'Unsupported file type' };
}

export function validateFileSize(bytes: number): { valid: boolean; error?: string } {
  if (bytes <= MAX_FILE_SIZE_BYTES) return { valid: true };
  return { valid: false, error: 'File size must be 10MB or less' };
}

export function validateInviteCode(code: string): { valid: boolean; error?: string } {
  if (!INVITE_CODE_REGEX.test(code.trim())) {
    return { valid: false, error: 'Invite code must be exactly 6 alphanumeric characters' };
  }
  return { valid: true };
}
