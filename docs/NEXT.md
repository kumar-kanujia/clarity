# NEXT — Duplicate & Similar Image Detection

Context: The core gallery views and backend pipelines are complete. This phase introduces a unified architecture for finding and resolving duplicate images. It is split into two parts: first, identifying exact duplicates using the existing BLAKE3 hashes, and second, extending that foundation to identify visually similar images.

Rule:
Work top to bottom.
Do not skip sections.
Do not introduce implicit behavior (e.g., auto-deleting duplicates).
All state transitions must remain explicit, deterministic, and observable.

---

# SECTION 1 — Exact Duplicate Resolution (Content Hash)

Goal: Leverage existing BLAKE3 hashes to group exact duplicates and provide a UI for users to safely resolve them using the existing bulk operation architecture.

## Part 1.1 — Backend Grouping API

- [ ] Define a standard API response for groups: e.g., `{ group_id, match_type: "EXACT", items: [...] }`.
- [ ] Implement query to group active images by identical BLAKE3 hashes (where `count > 1`).
- [ ] Ensure query respects soft-delete (exclude images in trash).
- [ ] Utilize cursor-based (keyset) pagination across the _groups_ to guarantee deterministic ordering and efficient loading.
- [ ] Guarantee deterministic ordering within each group (e.g., sort by ID or import timestamp).

## Part 1.2 — Duplicates Gallery UI

- [ ] Add "Duplicates" to the main navigation/sidebar views.
- [ ] Build a UI layout that visually separates distinct groups (e.g., card containers or distinct dividers per group).
- [ ] Display vital metadata inline (file size, resolution, import date) to assist user decisions.
- [ ] Integrate the existing multi-selection UI within the grouped view.
- [ ] Add "Keep Oldest" or "Keep Newest" quick-action helpers for faster selection within a group.
- [ ] Wire selected removals to the existing single-transaction bulk soft-delete operation.
- [ ] Ensure a group is immediately removed from the view once resolved (only one image remains).

---

# SECTION 2 — Similar Image Detection (Visual/Perceptual)

Goal: Introduce perceptual hashing (or embeddings) to find visually similar, but not byte-for-byte identical, images. Seamlessly integrate this into the UI built in Section 1.

## Part 2.1 — Backend Implementation

- [ ] Implement a new hashing strategy (e.g., dHash, pHash) during the import/thumbnailing pipeline to represent visual content.
- [ ] Create a background job or query to identify images with high similarity (low Hamming distance).
- [ ] Extend the Grouping API from Section 1 to return `{ match_type: "SIMILAR" }` payloads.

## Part 2.2 — UI Integration

- [ ] Update the Duplicates view to support a toggle or separate tab for "Exact Matches" vs "Similar Matches".
- [ ] Ensure the "Similar" view reuses the group separation layout, multi-selection, and bulk deletion workflows built in Part 1.2.
- [ ] Surface a "Similarity Score" or visual indicator in the UI to help users understand why the images were grouped.

---

# Exit Rule

When all sections are complete:

- Update CAPABILITIES.md to reflect Exact and Similar Image Detection features.
- Archive this file.
- Create new NEXT.md for the next phase.

System must remain:

- Deterministic
- Local-first
- Explicit
- Observable
- Reliable
