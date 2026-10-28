/**
 * Turns the Catalyst custom token returned by the `auth` function into a browser session.
 *
 * UNVERIFIED: this needs the Catalyst web SDK's custom-token sign-in and a shared domain
 * between the app and the functions (see docs/Frontend/Wealthspan_Frontend_Plan.md).
 * Until it is verified end-to-end on Catalyst, this fails loudly instead of pretending.
 */
export async function establishSession(_token: string): Promise<void> {
  throw new Error("Session sign-in is not wired up yet.");
}
