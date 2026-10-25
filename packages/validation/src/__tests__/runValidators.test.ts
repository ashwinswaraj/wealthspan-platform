import { describe, it, expect, vi } from 'vitest';
import { runValidators } from '../index';

describe('runValidators', () => {
  it('returns an empty object when all validators pass (return null)', () => {
    const validators = {
      email: vi.fn().mockReturnValue(null),
      password: vi.fn().mockReturnValue(null),
    };

    const errors = runValidators(validators);

    expect(errors).toEqual({});
    expect(validators.email).toHaveBeenCalledTimes(1);
    expect(validators.password).toHaveBeenCalledTimes(1);
  });

  it('returns an object with error messages when some validators fail', () => {
    const validators = {
      email: vi.fn().mockReturnValue('Email is required.'),
      password: vi.fn().mockReturnValue(null),
      name: vi.fn().mockReturnValue('Name must be at least 2 characters.'),
    };

    const errors = runValidators(validators);

    expect(errors).toEqual({
      email: 'Email is required.',
      name: 'Name must be at least 2 characters.',
    });
    expect(validators.email).toHaveBeenCalledTimes(1);
    expect(validators.password).toHaveBeenCalledTimes(1);
    expect(validators.name).toHaveBeenCalledTimes(1);
  });

  it('returns an empty object when provided an empty validators object', () => {
    const validators = {};

    const errors = runValidators(validators);

    expect(errors).toEqual({});
  });

  it('handles validators returning undefined correctly (should omit from errors)', () => {
    // Note: The type signature ValidationResult is string | null, but at runtime
    // someone might bypass the type system or a custom validator might return undefined.
    // The implementation uses `if (err)` which is falsey for undefined.
    const validators = {
      email: vi.fn().mockReturnValue(undefined),
      password: vi.fn().mockReturnValue('Error'),
    } as any; // Cast to bypass strict type check for testing runtime behavior

    const errors = runValidators(validators);

    expect(errors).toEqual({
      password: 'Error',
    });
  });
});
