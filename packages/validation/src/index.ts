/**
 * @jobrio/validation — single source of truth for client-side input validation.
 *
 * Every auth surface, signup step and dashboard form MUST validate through
 * these helpers so error copy, rules and strength scoring stay identical
 * across the platform and admin apps.
 *
 * NOTE: forms using these helpers must set `noValidate` on the <form> so the
 * browser's own validation bubble never appears — Wealthspan renders its own
 * custom inline error UI instead.
 */

export type ValidationResult = string | null;

/* ------------------------------------------------------------------ *
 * Primitive validators — return an error string, or null when valid.
 * ------------------------------------------------------------------ */

export const required = (value: unknown, label = "This field"): ValidationResult => {
  if (value === null || value === undefined) return `${label} is required.`;
  if (typeof value === "string" && !value.trim()) return `${label} is required.`;
  if (Array.isArray(value) && value.length === 0) return `${label} is required.`;
  if (typeof value === "boolean" && !value) return `${label} is required.`;
  return null;
};

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const validateEmail = (value: string, label = "Email"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (!v.includes("@"))
    return `Please include an '@' in the email address. '${v}' is missing an '@'.`;
  const [local, domain] = v.split("@");
  if (!local) return "Please enter the part before '@' in the email address.";
  if (!domain) return `Please enter a part following '@'. '${v}' is incomplete.`;
  if (!domain.includes("."))
    return `'${domain}' is not a complete domain — add a '.' (e.g. company.com).`;
  if (!EMAIL_RE.test(v)) return "Please enter a valid email address.";
  if (v.length > 255) return "Email must be less than 255 characters.";
  return null;
};

export const validateName = (value: string, label = "Full name"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (v.length > 100) return `${label} must be less than 100 characters.`;
  if (!/^[\p{L}\p{M}'.\- ]+$/u.test(v))
    return `${label} can only contain letters, spaces, apostrophes and hyphens.`;
  return null;
};

/** Indian mobile number — accepts "+91 98765 43210" or raw 10 digits. */
export const validatePhoneIN = (value: string, label = "Phone number"): ValidationResult => {
  const digits = (value ?? "").replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
  if (!local) return `${label} is required.`;
  if (local.length !== 10) return `${label} must be exactly 10 digits.`;
  if (!/^[6-9]/.test(local)) return `${label} must start with 6, 7, 8 or 9.`;
  return null;
};

export const validatePincode = (value: string, label = "Pincode"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (!/^\d{6}$/.test(v)) return `${label} must be exactly 6 digits.`;
  return null;
};

export const validateUrl = (value: string, label = "Link"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!url.hostname.includes("."))
      return `${label} must be a valid URL (e.g. https://example.com).`;
    return null;
  } catch {
    return `${label} must be a valid URL (e.g. https://example.com).`;
  }
};

export const validateMinLength = (
  value: string,
  min: number,
  label = "This field",
): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  return null;
};

export const validateMaxLength = (
  value: string,
  max: number,
  label = "This field",
): ValidationResult => {
  if ((value ?? "").length > max) return `${label} must be less than ${max} characters.`;
  return null;
};

export const validateFutureDate = (value: string, label = "Date"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return `${label} is not a valid date.`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() < today.getTime()) return `${label} cannot be in the past.`;
  return null;
};

export const validateDobAdult = (value: string, label = "Date of birth"): ValidationResult => {
  const v = (value ?? "").trim();
  if (!v) return `${label} is required.`;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return `${label} is not a valid date.`;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  if (age < 18) return "You must be at least 18 years old to use Wealthspan.";
  if (age > 100) return `${label} does not look correct.`;
  return null;
};

/* ------------------------------------------------------------------ *
 * Password rules + live strength scoring
 * ------------------------------------------------------------------ */

export interface PasswordCheck {
  id: string;
  label: string;
  passed: boolean;
}

export type PasswordStrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  /** 0–4 */
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  /** 0–100, drives the meter width */
  percent: number;
  checks: PasswordCheck[];
}

export const passwordChecks = (pw: string): PasswordCheck[] => [
  { id: "length", label: "At least 8 characters", passed: (pw ?? "").length >= 8 },
  { id: "upper", label: "One uppercase letter", passed: /[A-Z]/.test(pw ?? "") },
  { id: "lower", label: "One lowercase letter", passed: /[a-z]/.test(pw ?? "") },
  { id: "number", label: "One number", passed: /\d/.test(pw ?? "") },
  { id: "symbol", label: "One special character", passed: /[^A-Za-z0-9]/.test(pw ?? "") },
];

const LEVELS: { level: PasswordStrengthLevel; label: string }[] = [
  { level: "weak", label: "Weak" },
  { level: "weak", label: "Weak" },
  { level: "fair", label: "Fair" },
  { level: "good", label: "Good" },
  { level: "strong", label: "Strong" },
];

export const passwordStrength = (pw: string): PasswordStrengthResult => {
  const checks = passwordChecks(pw);
  if (!pw) {
    return { score: 0, level: "empty", label: "", percent: 0, checks };
  }
  let passed = checks.filter((c) => c.passed).length;
  // bonus for long passphrases, penalty for obvious sequences
  if (pw.length >= 14) passed += 1;
  if (/^(.)\1+$/.test(pw) || /12345|qwerty|password|wealthspan/i.test(pw)) passed -= 2;
  const score = Math.max(0, Math.min(4, passed - 1));
  const meta = LEVELS[score] ?? LEVELS[0];
  return {
    score,
    level: meta.level,
    label: meta.label,
    percent: ((score + 1) / 5) * 100,
    checks,
  };
};

export const validatePassword = (value: string, label = "Password"): ValidationResult => {
  const v = value ?? "";
  if (!v) return `${label} is required.`;
  const failing = passwordChecks(v).filter((c) => !c.passed);
  if (failing.length) return `${label} needs ${failing[0].label.toLowerCase()}.`;
  return null;
};

export const validatePasswordMatch = (pw: string, confirm: string): ValidationResult => {
  if (!confirm) return "Please confirm your password.";
  if (pw !== confirm) return "Passwords do not match.";
  return null;
};

/* ------------------------------------------------------------------ *
 * Form-level helper
 * ------------------------------------------------------------------ */

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

/** Runs a map of validators and returns only the fields that failed. */
export const runValidators = <T extends string>(
  validators: Record<T, () => ValidationResult>,
): FieldErrors<T> => {
  const errors: FieldErrors<T> = {};
  (Object.keys(validators) as T[]).forEach((key) => {
    const err = validators[key]();
    if (err) errors[key] = err;
  });
  return errors;
};

export const hasErrors = (errors: FieldErrors): boolean => Object.keys(errors).length > 0;

// Wealthspan finance domain validators.
export * from "./finance";
