export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

export function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}