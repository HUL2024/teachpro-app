// Supabase Auth accounts always need an email under the hood. To let
// learners log in with just a phone number + password (no SMS/OTP
// infrastructure required), we generate a stable internal email from their
// phone number and use that for actual authentication -- the learner never
// sees or types it. Admin accounts are unaffected; they still use a real
// email address.

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneDigits(phone)
  return digits.length >= 10 && digits.length <= 12
}

export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhoneDigits(phone)}@phone.teachpro.app`
}

// The shared Login screen accepts either a phone number (learners) or a
// real email (admins), auto-detected by whether '@' is present.
export function loginInputToAuthEmail(input: string): string {
  return input.includes('@') ? input.trim() : phoneToAuthEmail(input)
}
