**v1 Scan & Reconcile Specification**

---

# 📦 Feature Specification: Library Scan & Reconciliation

## 🎯 Purpose

Synchronize the application database with the actual:

* VPX Tables folder
* ROMs folder

And allow the user to reconcile differences safely.

---

# 1️⃣ Scan Inputs

### Required Configuration

* `tablesFolderPath`
* `romsFolderPath`

### Scan Sources

* All `.vpx` files in tables folder
* All `.zip` (ROM) files in ROMs folder

---

# 2️⃣ Detection Logic

For each `.vpx` file:

1. Parse script
2. Detect:

   * `expected rom file`

For each `.zip` file:

* Extract ROM file name

---

# 3️⃣ Reconciliation Categories

The scan produces a structured result:

```ts
type ScanResult = {
  matched: MatchedTable[]
  newTables: NewTable[]
  newRomsUnmatched: RomFile[]
  missingFromDisk: MissingDbTable[]
}
```

---

# 4️⃣ Categories Explained

---

## ✅ A. Matched Tables

Definition:

* Table file exists
* DB entry exists
* ROM state matches (if required)

No action required.

Optional:

* Update metadata (file size, last modified, etc.)

---

## ➕ B. Newly Found Tables (Not in DB)

Definition:

* `.vpx` exists
* No DB entry

UI Requirements:

* Show detected ROM or expected ROM name if cannot match
* Allow editing ROM manually
* Allow deselecting from import
* All are preselected

User Actions (toggle):

* [Import Selected]
* [Ignore]

On Import:

* Create DB entry
* Link ROM
* Set `dateAdded = now`

---

## ⚠ C. Newly Found Unmatched ROMs

Definition:

* `.zip` exists
* Not referenced by:

  * Any DB table
  * Any newly detected table

UI Requirements:

* Show ROM name
* Multi-select
* Default: selected for deletion

User Actions (toggle):

* [Delete Selected]
* [Keep Selected]

Safety:
* No auto-deletion
* Confirmation dialog required

---

## ❌ D. Tables in DB but Missing Files

Definition:

* DB entry exists
* `.vpx` or `rom` file not found

Additionally detect:

* ROM missing?
* Both missing?

UI Requirements:

Display:

* Table name
* Missing status:

  * Table missing
  * ROM missing
  * Both missing

User Actions:

* [Remove from Library]
* [Keep Entry]

If ROM missing but table exists:

* Allow editing ROM reference

---

# 5️⃣ State Classification Matrix

| Table File | ROM File | DB Entry | Category                |
| ---------- | -------- | -------- | ----------------------- |
| ✅          | ✅        | ✅        | Matched                 |
| ✅          | ❌        | ❌        | New Table               |
| ❌          | ❌        | ✅        | Missing From Disk       |
| ❌          | ✅        | ❌        | New Unmatched ROM       |
| ✅          | ❌        | ✅        | DB Entry w/ Missing ROM |

---

# 6️⃣ UI Flow Specification

### Step 1: User Clicks “Scan Library”

Show loading indicator.

---

### Step 2: Show Reconciliation Dashboard

Sections:

```
Scan Results

[New Tables (7)]
[Unmatched ROMs (3)]
[Missing From Disk (2)]
```

Each collapsible.

---

### Step 3: Batch Actions

Each section supports:

* Multi-select
* Confirmed destructive actions
* Clear visual risk indicators

---

# 7️⃣ Database Mutation Rules

### NEVER auto-mutate DB during scan.

Only mutate when user confirms:

* Import new tables
* Delete ROMs
* Remove DB entries

---

# 8️⃣ Edge Case Handling

### A. Table requires ROM but none found

Mark:

```
⚠ ROM not found
```

Allow manual selection from existing ROM list.

---

### B. Multiple tables referencing same ROM

Allowed.

ROM should not be classified as “unmatched”.

---

### C. Duplicate ROM files (same name)

Treat by filename only (v1 simplification).

---

# 9️⃣ Non-Goals for v1

Do NOT:

* Validate ROM contents
* Extract checksums
* Compare ROM versions
* Auto-fix DB inconsistencies silently
* Modify table scripts

---

# 🔟 Success Criteria

After reconciliation:

* DB accurately reflects disk state
* No phantom tables
* No orphaned ROMs (unless user keeps them)
* Launch should never fail due to missing file

---

# 🧠 Architectural Insight

This feature makes your app:

From:

> Import tool

To:

> System authority over VPX environment

This is a major maturity step.

---

If you want next, we can:

* Design the internal scan algorithm step-by-step
* Define clean TypeScript interfaces for this
* Or simulate edge cases to stress-test this spec

What do you want to refine?
