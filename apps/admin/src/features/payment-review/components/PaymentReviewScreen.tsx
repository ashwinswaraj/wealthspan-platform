/**
 * Admin screen for approving subscription payments (UTR submitted by users).
 * Backend: `createSubscriptionService().listPending/review` (apps/api/src/features/subscription).
 * The API routes and the admin session are not wired yet, so this screen only states that.
 */
export function PaymentReviewScreen() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Wealthspan Admin</h1>
      <p className="mt-2 text-neutral-600">
        Payment approvals will appear here once the subscription routes are connected.
      </p>
    </main>
  );
}
