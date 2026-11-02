# Data Quality Lifecycle

> Status: Planned (guards shipped) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Flow

1. **Detect** at entry time: card-bill look-alike or same-amount card expense (shipped warnings).
2. **Prompt**: the user converts it to a transfer, keeps it, or cancels.
3. **Review** (Planned): later duplicates or outliers are listed for the user to resolve; resolution is recorded.
4. **Admin view** (Planned): aggregate counts only, never user content.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)
