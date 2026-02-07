# Database Decision for Image Management Tool

**Date:** 2026-02-07  
**Project:** Clarity  
**Author:** Kumar + GPT

---

## 1. Project Requirements

- Desktop application using **Tauri v2**
- Manages **tens of thousands of images**
- Supports:
  - Image **tags**
  - **OCR text** extraction
  - Descriptions
- Images stored **locally**
- Requires **fast search** and filtering
- Will perform **background tasks** (indexing, thumbnail generation, OCR)

---

## 2. Considered Database Libraries

| Library      | Pros                                                               | Cons                                                                                     |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Diesel       | Strong Rust type safety, ORM features, migrations                  | Sync-only by default, DSL cumbersome for FTS and complex queries, slower experimentation |
| SQLx         | Async-first, raw SQL, compile-time verified queries, supports FTS5 | No built-in ORM abstractions; manual migrations required                                 |
| SeaORM       | Async ORM with entity models                                       | Heavier, less flexible for raw SQL queries, learning curve                               |
| rusqlite     | Lightweight SQLite wrapper, simple                                 | Sync-only, manual async/thread management, no ORM                                        |
| Sled/RocksDB | High-performance embedded key-value store                          | Not relational; unsuitable for complex queries                                           |

---

## 3. Decision

**Chosen:** `SQLx` with `SQLite`

### Reasons:

1. **Full-Text Search (FTS5)** support for tags, OCR text, and descriptions
2. **Async support** for background indexing, OCR, and thumbnail generation
3. **Raw SQL** allows flexible queries and complex filters
4. **SQLite** is lightweight, local, and scales well to tens of thousands of images
5. Schema evolution is expected; raw SQL migrations make this easier
6. Diesel/ORMs add unnecessary abstraction for this type of app

---

## 4. Implementation Notes

- **Database file location:** Use Tauri’s app data directory (platform-specific)
- **SQLite settings:**
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  ```
