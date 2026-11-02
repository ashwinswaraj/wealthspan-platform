# Incident Response

> Status: Draft · Last updated: 2026-11-01

1. **Detect:** user report, Catalyst logs, admin health, error spikes.
2. **Contain:** rotate leaked keys and re-set them in the console; remove an admin from `ADMIN_EMAILS` and redeploy; disable a function in Catalyst if needed.
3. **Assess:** use function logs and the `audit_log` to see which users and records were affected.
4. **Notify:** affected users and, where law requires, the authority within the prescribed time (India DPDP Act / CERT-In rules: lawyer to confirm timelines).
5. **Fix and review:** patch, add a test, update the [Threat Model](Threat_Model.md).

Owner: Ashwin Swaraj until a team exists. Contact list and escalation: TBD.
