## 📌 Phase 3 Context Note — Why This Shift

Phase 3 intentionally shifts away from app-managed file storage toward a **reference-based, database-driven model**.

This decision is not a rollback of Phase 2, but a **strategic change in scope**.

Phase 2 proved that managed storage, stable identity, and scalable import are _possible_.
However, fully owning user files introduces significant long-term complexity:

- Storage growth and bloat inside app data
- Migration and backup responsibility
- Corruption and partial-failure recovery
- High stabilization cost before shipping user-visible features

These concerns are **orthogonal** to the core product goal: building useful image-centric features.

Phase 3 prioritizes **feature velocity and correctness** by:

- Treating image files as external, read-only resources
- Using the database as the authoritative source of truth
- Making all user value flow from metadata and indexing, not file custody

This allows the project to:

- Ship image features faster
- Reduce risk and maintenance burden
- Keep behavior explicit and predictable
- Preserve trust by avoiding silent file ownership

The architectural work done in Phase 2 is not discarded — concepts like stable identity, deterministic retrieval, and explicit behavior continue to inform the design — but **file ownership is deliberately removed from the app’s responsibilities**.
