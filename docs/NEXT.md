# NEXT — Untagged Gallery, Backend Refinement, and UI Polish

Context: Core backend functionality and bulk state transitions are complete and production-ready. Before advancing to duplicate detection, this phase focuses on structural polish: introducing an untagged gallery view, rigorously auditing existing backend commands, and sharpening the UI for a tighter, more cohesive user experience.

Rule:
Work top to bottom.
Do not skip sections.
Do not introduce implicit behavior.
All state transitions must remain explicit, deterministic, and observable.

---

# SECTION 1 — Untagged Gallery View

Goal: Implement a deterministic gallery view for images that currently have zero tag assignments, ensuring no images get "lost" in the library.

## Part 1.1 — Backend Implementation

- [x] Define backend query for retrieving untagged images
- [x] Ensure query respects soft-delete (exclude images in trash)
- [x] Ensure query utilizes cursor-based (keyset) pagination
- [x] Guarantee deterministic ordering (e.g., by ID or timestamp)
- [x] Ensure readability filtering is applied

Completion Check:

- [x] Query returns correct, paginated results
- [x] Performance remains stable on large datasets

## Part 1.2 — UI Integration

- [x] Add "Untagged" to the main navigation/sidebar views
- [x] Wire up the untagged gallery to the new backend query
- [x] Ensure multi-selection and bulk operations work seamlessly within this view
- [x] Provide a clear "Empty State" message when all images are tagged

Completion Check:

- [x] Untagged view correctly displays images missing tags
- [x] Bulk tagging an image immediately removes it from the untagged view

---

# SECTION 2 — Backend Command Refinement

Goal: Audit and improve existing backend commands to ensure maximum consistency, performance, and adherence to the project's strict error taxonomy and logging rules.

## Part 2.1 — Command Audit & Consistency

- [x] Improve image pipline
- [x] Review all single-item and bulk commands for consistent parameter handling
- [x] Ensure single DB transactions are strictly used where multiple mutations occur
- [x] Audit all SQL queries for N+1 execution flaws
- [x] Verify that all commands return clean, predictable payload structures to the frontend

## Part 2.2 — Error Handling & Logging Standardization

- [x] Ensure all commands map failures to the explicit error taxonomy (`AppError`, `DatabaseError`, etc.)
- [x] Verify no raw image data or sensitive OS paths are leaked in frontend error messages
- [x] Standardize structured tracing logs across all commands (inputs, execution time, result state)
- [x] Audit worker panic containment and retry limits

Completion Check:

- [x] Backend commands are universally consistent in input, output, and failure modes
- [x] Logs provide full operational observability without noise

---

# SECTION 3 — UI Polish and Sharpness

Goal: Elevate the UI from "good" to "sharp." Improve visual hierarchy, component feedback, and overall aesthetic crispness without bloating the frontend.

## Part 3.1 — Visual Hierarchy & Typography

- [ ] Refine typography (font sizes, weights, line heights) for better readability
- [ ] Standardize spacing, padding, and margins across all gallery views and sidebars
- [ ] Polish border radii, subtle borders, and contrast ratios for a cleaner aesthetic
- [ ] Improve scrollbar styling to match the application theme

## Part 3.2 — Component Feedback & Interactions

- [ ] Enhance hover states on image thumbnails, tags, and buttons
- [ ] Polish multi-selection visual indicators (e.g., clearer checkmarks, border highlights)
- [ ] Smooth out transitions for entering/exiting selection mode
- [ ] Ensure loading states (skeletons or spinners) are subtle and non-jarring
- [ ] Sharpen modal and dialog animations (bulk action confirmations, tag creation)

Completion Check:

- [ ] UI feels immediately responsive and visually cohesive
- [ ] Selection and action states are unmistakable to the user

---

# Exit Rule

When all sections are complete:

- Update CAPABILITIES.md to reflect the Untagged View and UI/Backend stability guarantees.
- Archive this file.
- Create new NEXT.md for the Duplicate Detection phase.

System must remain:

- Deterministic
- Local-first
- Explicit
- Observable
- Reliable
