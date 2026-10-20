# VPX Micro Frontend

A desktop application for managing and launching Visual Pinball X tables and ROMs, built with Electron, Next.js, React, and TypeScript. Available for Windows and macOS.

![VPX Micro Frontend dashboard](public/readme/hero-dashboard.png)

## Table of Contents

- [What you can do](#what-you-can-do)
- [Tech Stack](#tech-stack)
- [Install](#install)
- [First-time setup - Windows](#first-time-setup---windows)
- [First-time setup - macOS](#first-time-setup---macos)
- [Add tables to your library](#add-tables-to-your-library)
- [Work with tables](#work-with-tables)
- [Settings reference](#settings-reference)
- [Minimal run notes (dev)](#minimal-run-notes-dev)

## What you can do

- Import `.vpx` tables and `.zip` ROM files
- Scan your VPX folder and auto-detect tables/ROMs
- Search, sort, and favorite tables
- Auto-detect table image with manual overrides
- Play a random table from your selected library
- Launch tables from the app
- Rename, delete, or archive entries
- View recently played tables
- Export tables (all, favorites, or archived)
- Connect Android mobile devices to sync selected tables and ROMs (experimental)

## Tech Stack

- Electron
- Next.js
- React
- TypeScript

The Next.js frontend runs in an Electron desktop application, which provides access to local files and launching external applications.

## Install

Download the latest build from GitHub Releases for your platform:

- [VPX Micro Frontend Releases](https://github.com/AAmanzi/vpx-micro-frontend/releases)

### Windows

**Download options:**

- **Installer (recommended)**
  - Download `VPX-Micro-Frontend-Setup-<version>-windows-x64.exe`
  - Standard Windows installation flow
  - Creates Start Menu/Desktop shortcuts
  - Best for most users

- **Portable (`.exe`)**
  - Download `VPX-Micro-Frontend-<version>-windows-x64.exe`
  - No installation required
  - Run directly from any folder or USB drive
  - Good for testing or restricted environments

**Smart App Control (Windows 11):**

This app is currently unsigned, so Smart App Control may block it. If the app does not start and Windows does not show a **Run anyway** option, confirm that you downloaded it from the [official releases page](https://github.com/AAmanzi/vpx-micro-frontend/releases). Smart App Control may need to be turned off to run the app; this reduces protection for other apps on your device, so only do so if you trust the source and are comfortable with that security tradeoff.

### macOS

**Download and install:**

1. Download the `.dmg` file from releases that matches your Mac:
   - **Apple Silicon** (M1 or newer): `VPX-Micro-Frontend-<version>-macos-arm64.dmg`
   - **Intel**: `VPX-Micro-Frontend-<version>-macos-x64.dmg`

   Not sure which you have? Open **Apple menu → About This Mac** and check **Chip** (Apple M-series) or **Processor** (Intel).

2. Open the `.dmg` file
3. Drag the VPX Micro Frontend app into the **Applications** folder
4. Open Applications and launch **VPX Micro Frontend**

After installation, open the app and continue with first-time setup below.

## First-time setup - Windows

![Settings file paths - Windows](public/readme/settings-file-paths.png)

1. Open **Settings** from the left navigation.
2. In **File Paths**, set **VPX Root Directory** (the folder containing `VPinballX.exe`).
3. Confirm **ROMs Directory** and **Tables Directory**.
   - These auto-sync with the root path by default, but you can override if needed.

## First-time setup - macOS

The app includes a guided setup wizard to help you configure VPX on macOS.

![Settings file paths - macOS](public/readme/settings-file-paths-mac.png)

**Guided Setup (Recommended):**

Click **Begin Setup** in the Settings → File Paths section to start a step-by-step guide that covers:

1. Installing/locating VPX
2. Configuring the VPX executable path
3. Setting up Tables and ROMs folders
4. Configuring ROM support (PinMAME)

![Setup guide - Install VPX macOS build](public/mac-setup/install-macos-build.png)

**Manual Setup:**

This expects that you already have VPX and PinMAME installed and configured on your Mac.

1. Open **Settings** from the left navigation.
2. In **File Paths**, set the paths to your VPX installation:
   - **VPX App Path**: path to `VPinballX_BGFX.app` bundle
   - **Tables Directory**: where your `.vpx` files are stored
   - **ROMs Directory**: where your ROM files (`.zip`) are stored

## Add tables to your library

If you already have an existing VPX setup, start with Scan Library first.

### Option A: Scan your VPX library

![Scan library workflow](public/readme/scan-library.gif)

1. Click **Scan Library** (top-right) or open it from **Settings → Data Management**.
2. Review detected matches.
3. Apply results.

### Option B: Import files/folders

![Import workflow](public/readme/import-tables.gif)

1. Click **Import Tables**.
2. Drag/drop `.vpx`, `.zip`, `.directb2s`, or folders.
3. Review detected tables, ROMs, and backglass assignments.
4. Optionally enable **Delete original files after import**.
5. Click **Import Tables**.

**DirectB2S on macOS:** Playback compatibility hasn't been verified by this
project. You can import, assign, scan, and export backglass files, but playback
may require additional setup outside this app.

## Work with tables

### All Tables

- Use search to match table name, `.vpx` filename, or ROM filename.
- Use the order picker to sort.
- Toggle **Keep favorites on top**.
- Click **Random Table** to play a random table from your library.

### Favorites

- Click the ⭐ on a table card to favorite/unfavorite.

### Archive

- Archive tables you want to hide from your active library.
- Archived tables remain in your database and can be restored anytime.
- Use the **Archive** tab to view and manage archived tables.

### Recently Played

- Tables appear here after they are launched.
- Sort picker is shown but disabled in this view.

### Table card actions

![Table card actions](public/readme/table-card-actions.png)

- **Play** button launches the table.
- **Kebab menu** groups table actions:
  - Rename Table and Table Image
  - **Files:** Edit ROM, Edit Backglass, and VPX Executable. The executable action opens launch settings for a different VPX executable and, on Windows, optional per-table launch-flag overrides. Unset flags use the global defaults.
  - **Library:** Archive Table / Unarchive Table to hide or restore the table in your active library.
  - **Delete Table:** removes the DB entry and deletes the table's files from VPX folders.

### Table Images

Table images are automatically fetched from the [Virtual Pinball Spreadsheet database](https://virtualpinballspreadsheet.github.io/vps-db/db/vpsdb.json). If an image isn't available or you want to use a different one:

1. Open the table **Kebab menu** and click **Table Image**.
2. Browse alternate image results for that table.
3. Select the image you prefer, or manually enter a custom image URL.

![Image Select Modal](public/readme/image-select-modal.png)

Images are cached locally; if the VPS DB is unavailable, your previously cached images remain visible.
There's also a snapshot of VPS DB as backup at [VPS Backup snapshot](https://aamanzi.github.io/vps-db/db/vpsdb.json)

## Settings reference

### File Paths

- VPX root path
- ROMs directory
- Tables directory
- VPX executable path (global/default launcher)
- Direct link to VPX Releases (onboarding helper)

### Data Management

![Data Management settings](public/readme/settings-data-management.png)

- **Scan VPX Library** — detect and auto-match tables and ROMs
- **Export Tables** — create a shareable bundle with options:
  - Export all tables
  - Export favorites only
  - Export archived tables only

![Export tables modal](public/readme/export-tables-modal.png)

![Export result](public/readme/export-result.png)

### Android (Experimental)

![Android sync workflow](public/readme/android-sync-workflow.gif)

- Enable Android Features in Settings > Maintenance
- Mark tables as "Android" and preview them in the Android tab
- From the **Android tab**, select **Sync Android**
- Preview Changes and sync your libraries

![Enable android features](public/readme/android-features-enabled.png)
![Mark table for android](public/readme/mark-for-android.png)

#### Android Settings

- **Android Web Server URL**
- **Android Tables Directory** — advanced setting; change only if you know what you're doing
- **Android ROMs Directory** — advanced setting; change only if you know what you're doing

#### Android Device Setup

The app does not include an Android application. Instead, it syncs files to a folder on your Android device over the network.

To use Android sync, you need a VPX-compatible Android environment on your device.

You can find Android builds here:
https://github.com/vpinball/vpinball/releases

Install the provided `.apk` (usually included in the release `.zip`).

---

#### Enabling the Android server from device

On your Android device:

1. Start VPX
2. Open settings for any table (or global settings depending on build)
3. Enable **Web Server**
4. A **server URL (IP address)** will be shown

### Maintenance

- **Fullscreen** toggles fullscreen mode. Press **F11** on Windows or **Ctrl+Cmd+F** on macOS to toggle it from anywhere in the app. Window size, position, maximized state, and fullscreen state are restored on the next launch.
- **Clear Library Data** resets app metadata/list only.
- It does **not** delete your actual VPX/ROM files.
- **Database Migrations** run automatically on app update to keep existing data compatible.

The library migration saves backups of library data, app configuration, and
migration history in the active app-data directory's `backups` folder before
converting the library.

### Advanced launch settings (Windows)

In **Settings → Advanced → VPX launch flags**, configure the global defaults:

- **Limit CPU threads** passes `-LessCPUthreads` to VPX.
- **Legacy pause menu** passes `-ExtMinimized` and is enabled by default. It is required for VPX 10.8.0 and earlier; turn it off for VPX 10.8.1 and newer, where it causes a launch error. The newer version's pause menu opens with **F12** by default.
- Use **Reset to defaults** to restore the built-in settings.

To override either flag for one table, open its **Kebab menu → VPX Executable → Launch flags (advanced)**. Choose **Use default**, **On**, or **Off** for each flag. macOS launches do not use these Windows command-line flags.

### VPX utilities

- **Open VPX Folder** opens the configured VPX root folder for quick manual checks/cleanup.
- **Run VPX** launches VPX without loading a table.

## Minimal run notes (dev)

If you are running this locally from source:

```bash
yarn install
yarn dev
```

Development runs use a separate `-dev` data store so development data stays separate from the installed app. `yarn db:reset` clears the development store by default; pass `--prod` only when you intentionally want to clear the production store.

### Data mocking notes

You can mock VPX by creating empty folders and pointing the app to them in **Settings → File Paths**.

Use this structure:

```text
/mockVpxFolder
  /Tables
  /VPinMAME
    /roms
```

Then set **VPX Root Directory** to `/mockVpxFolder`.

The app will default the table and ROM paths to:

- `/mockVpxFolder/Tables`
- `/mockVpxFolder/VPinMAME/roms`

## Build and package for distribution

This project supports production packaging via Electron Builder for Windows and macOS.

### 1. Install dependencies

```bash
yarn install
```

### 2. Build production assets only

```bash
yarn build:prod
```

This creates:

- `out/` (static Next renderer)
- `dist-electron/main.js` and `dist-electron/preload.js` (bundled Electron files)

### 3. Create Windows distributables

```bash
yarn dist:win
```

Artifacts are written to `dist/`:

- NSIS installer `.exe`
- Portable `.exe`

### 4. Create macOS distributable

```bash
yarn dist:mac
```

Artifacts are written to `dist/`:

- `.dmg` file (drag-and-drop installer)

### 5. Create unpacked app only (quick local validation)

```bash
yarn dist:dir
```

This outputs `dist/win-unpacked/` (or platform-specific equivalent).

### Notes

- Builds are platform-specific; run on Windows to build `.exe` and on macOS to build `.dmg`.
- If Defender/permissions interfere with Windows packaging, run the terminal as Administrator and retry.
- macOS builds require Xcode command-line tools: `xcode-select --install`

## Building release artifacts

Release artifacts can be built using **GitHub Actions** without a local build environment.

1. Go to **Actions → Build release artifacts → Run workflow**.
2. Once completed, download the separate artifacts from the workflow run:
   - **Windows x64 installer:** `VPX-Micro-Frontend-Setup-<version>-windows-x64.zip` contains the matching `.exe`
   - **Windows x64 portable:** `VPX-Micro-Frontend-<version>-windows-x64.zip` contains the matching `.exe`
   - **macOS x64 (Intel):** `VPX-Micro-Frontend-<version>-macos-x64.zip` contains the matching `.dmg`
   - **macOS arm64 (Apple Silicon):** `VPX-Micro-Frontend-<version>-macos-arm64.zip` contains the matching `.dmg`
3. Test the artifacts and manually publish them through **GitHub Releases**.

The version is read from `package.json`. Each ZIP contains one file with the same base name; extract it to access the installer, portable executable, or disk image. The workflow fails if a required file is missing. Artifacts are retained for 14 days.

> **Note:** Builds are unsigned. macOS may display security warnings. The workflow does not create drafts or modify releases, even if a release for the same version already exists.

## Troubleshooting

- If scan/import appears outdated, re-open the view or run a fresh scan.
- If local test data gets messy during development:

```bash
yarn db:reset
```
