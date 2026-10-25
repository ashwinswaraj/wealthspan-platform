import { describe, it, expect } from 'vitest';
import { validateEmail } from '../index';

describe('validateEmail', () => {
  it('returns null for valid emails', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name+tag@example.co.uk')).toBeNull();
    expect(validateEmail('user-name@sub.domain.org')).toBeNull();
    expect(validateEmail('1234567890@example.com')).toBeNull();
  });

  it('returns required error for empty strings', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('uses custom label for required error', () => {
    expect(validateEmail('', 'Work Email')).toBe('Work Email is required.');
  });

  it('returns error for missing @ symbol', () => {
    expect(validateEmail('testexample.com')).toBe(
      "Please include an '@' in the email address. 'testexample.com' is missing an '@'."
    );
  });

  it('returns error for missing local part', () => {
    expect(validateEmail('@example.com')).toBe(
      "Please enter the part before '@' in the email address."
    );
  });

  it('returns error for missing domain part', () => {
    expect(validateEmail('test@')).toBe(
      "Please enter a part following '@'. 'test@' is incomplete."
    );
  });

  it('returns error for missing dot in domain', () => {
    expect(validateEmail('test@example')).toBe(
      "'example' is not a complete domain — add a '.' (e.g. company.com)."
    );
  });

  it('returns generic error for invalid characters/format failing regex', () => {
    // These strings fail the regex validation
    expect(validateEmail('test space@example.com')).toBe('Please enter a valid email address.');
    expect(validateEmail("!#$%&'*+-/=?^_`{|}~@example.com")).toBe('Please enter a valid email address.');
  });

  it('returns error if email exceeds 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(validateEmail(longEmail)).toBe('Email must be less than 255 characters.');
  });
});
