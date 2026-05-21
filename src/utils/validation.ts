const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const INVITE_CODE_LENGTH = 6;

export function validateRequired(value: string, fieldName = 'Field'): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const required = validateRequired(email, 'Email');
  if (required) return required;
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  const required = validateRequired(password, 'Password');
  if (required) return required;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  const required = validateRequired(confirmPassword, 'Confirm password');
  if (required) return required;
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

export function validateInviteCode(code: string): string | null {
  const required = validateRequired(code, 'Invite code');
  if (required) return required;
  if (code.trim().length !== INVITE_CODE_LENGTH) {
    return `Invite code must be ${INVITE_CODE_LENGTH} characters`;
  }
  return null;
}
