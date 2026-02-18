# NEXT — Query Expansion, Tag System Expansion, and System Reliability Hardening

> Context:
> Core backend is complete and deterministic. Duplicate detection, tagging backend, and structured logging exist.
>
> This phase focuses on expanding query capabilities, improving tag system functionality, and strengthening system reliability.
>
> Rule:
> Work top to bottom.
> Do not skip sections.
> Do not introduce implicit behavior.
> UI work is out of scope except UI data management layer integration.

---

# SECTION 1 — Image Query, Sorting, and Pagination Expansion

Goal: Provide complete, deterministic, and flexible image retrieval across all supported access patterns.

---

## Part 1.1 — Core Image Retrieval Expansion

- [x] Fetch image by ID
- [x] Fetch images by multiple IDs
- [ ] Fetch images by name
- [ ] Fetch images by multiple names
- [ ] Fetch images by tag
- [ ] Fetch images by multiple tags
- [ ] Fetch favorite images
- [ ] Fetch images in trash / bin
- [ ] Support combined filtering (name, tags, favorites, trash)

Completion Check:

- [ ] All image access patterns supported
- [ ] All queries deterministic
- [ ] No ambiguity in returned results

---

## Part 1.2 — Sorting System Expansion

- [ ] Sort images by name
- [ ] Sort images by file size
- [ ] Sort images by import date
- [ ] Sort images by resolution
- [ ] Support ascending sorting
- [ ] Support descending sorting
- [ ] Maintain deterministic ordering across all sorting modes

Completion Check:

- [ ] Sorting consistent and stable
- [ ] Sorting compatible with all filters

---

## Part 1.3 — Pagination System Improvement

- [ ] Stable pagination across all queries
- [ ] Pagination compatible with sorting
- [ ] Pagination compatible with tag filtering
- [ ] Pagination compatible with favorites
- [ ] Pagination compatible with trash
- [ ] Pagination compatible with duplicate queries

Completion Check:

- [ ] Pagination stable under all sorting and filtering modes
- [ ] No missing or duplicate results across pages

---

## Part 1.4 — Favorites System

- [ ] Mark image as favorite
- [ ] Remove favorite status
- [ ] Retrieve favorite images
- [ ] Combine favorites with sorting
- [ ] Combine favorites with filtering

Completion Check:

- [ ] Favorite state reliable and persistent
- [ ] Favorites integrate cleanly with queries

---

# SECTION 2 — Tag System Expansion and Organization Improvements

Goal: Provide complete and flexible tag management and tag-based organization.

---

## Part 2.1 — Tag Management Expansion

- [ ] Create tag
- [ ] Rename tag
- [ ] Delete tag
- [ ] Change tag color
- [ ] Prevent duplicate tag names

Completion Check:

- [ ] Tag lifecycle fully supported
- [ ] Tag identity remains stable

---

## Part 2.2 — Tag Assignment Expansion

- [ ] Assign tag to image
- [ ] Remove tag from image
- [ ] Assign multiple tags to image
- [ ] Remove multiple tags from image

Completion Check:

- [ ] Tag assignment reliable
- [ ] Tag relationships consistent

---

## Part 2.3 — Tag Query and Insights Expansion

- [ ] Retrieve all tags
- [ ] Retrieve tag details
- [ ] Retrieve images associated with tag
- [ ] Retrieve image count per tag
- [ ] Retrieve tag usage information

Completion Check:

- [ ] Tag queries complete and reliable
- [ ] Tag data consistent across operations

---

## Part 2.4 — Tag-Based Filtering Expansion

- [ ] Filter images by single tag
- [ ] Filter images by multiple tags
- [ ] Combine tag filtering with sorting
- [ ] Combine tag filtering with favorites

Completion Check:

- [ ] Tag filtering reliable
- [ ] Tag filtering compatible with all query modes

---

# SECTION 3 — System Reliability, Integrity, and Error Handling Enhancement

Goal: Strengthen system robustness, reliability, and error handling coverage.

---

## Part 3.1 — Trash / Bin System

- [ ] Move image to trash
- [ ] Restore image from trash
- [ ] Permanently delete image
- [ ] Retrieve trash contents
- [ ] Support sorting and pagination in trash

Completion Check:

- [ ] Trash state reliable
- [ ] No unintended permanent data loss

---

## Part 3.2 — Duplicate Query Expansion

- [ ] Retrieve duplicate images
- [ ] Retrieve duplicate groups
- [ ] Retrieve images in duplicate group
- [ ] Support sorting and pagination of duplicates

Completion Check:

- [ ] Duplicate state fully observable
- [ ] Duplicate queries reliable

---

## Part 3.3 — Error Handling Enhancement

- [ ] Improve error classification coverage
- [ ] Ensure consistent error reporting across all operations
- [ ] Ensure recoverable errors do not break system state
- [ ] Ensure graceful failure handling
- [ ] Ensure safe handling of invalid queries
- [ ] Ensure safe handling of missing files
- [ ] Ensure safe handling of invalid tag operations
- [ ] Ensure safe handling of invalid pagination states

Completion Check:

- [ ] System resilient to all supported operations
- [ ] No silent failures
- [ ] Errors observable and diagnosable

---

## Part 3.4 — Data Integrity and Consistency

- [ ] Detect missing image files
- [ ] Detect broken references
- [ ] Ensure consistent relationships between images and tags
- [ ] Ensure consistent duplicate state
- [ ] Ensure reliable data retrieval under all conditions

Completion Check:

- [ ] System integrity maintained
- [ ] Data state reliable and deterministic

---

## Part 3.5 — UI Data Management Layer Integration

(UI data layer only — no UI features)

- [ ] Integrate centralized UI data management layer
- [ ] Ensure consistent data synchronization
- [ ] Ensure safe handling of data updates
- [ ] Ensure efficient data loading and caching

Completion Check:

- [ ] UI data layer stable
- [ ] UI safely synchronized with backend state

---

# Exit Rule

When all sections are complete:

1. Update CAPABILITIES.md
2. Declare backend query and organization system production-ready
3. Create NEXT.md focused on advanced features or UI functionality
4. Archive this file

System must remain:

- Deterministic
- Local-first
- Explicit
- Observable
- Reliable
