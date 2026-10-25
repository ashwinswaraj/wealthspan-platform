/**
 * Thin compatibility shim. All auth-surface inputs now delegate to the
 * canonical `@jobrio/ui/design-system` primitives (AuthInput / AuthTextarea /
 * AuthSelect / AuthFieldShell). Zero visual change — the DS components
 * are pixel-locked to the previous implementation.
 *
 * New code MUST import from `@jobrio/ui/design-system` directly.
 */
import { AuthFieldShell, AuthInput, AuthSelect, AuthTextarea } from "@jobrio/ui/design-system";

export const FieldShell = AuthFieldShell;
export const TextInput = AuthInput;
export const SelectInput = AuthSelect;
export const TextareaInput = AuthTextarea;
