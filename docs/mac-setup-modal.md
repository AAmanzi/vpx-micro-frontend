# Step 1 — Install VPX macOS Build
Open the VPX GitHub repository

Button:
- Open VPX Repository

Note: Prefer BGFX builds over OpenGL builds for best compatibility and rendering.

Steps:

In GitHub:
1. Open the Actions tab
2. Find a workflow that builds VPinball
3. Open a successful run
4. Scroll to Artifacts
5. Download:
  - VPinball_BGFX-macos-arm64 (Apple Silicon, most modern Macs)
  - OR VPinball_BGFX-macos-x64 (Intel Mac)

Go next Button:
- Continue

screenshots:
1. Github Actions tab (highlight vpinball workflow)
2. Artifacts with highlighted macos releases

------

# Step 2 - Configure VPX executable

- VPX executable input

Go next Button:
- Continue

------

# Step 3 - Configure Library Folder

Variant select: "Automatic" or "Custom"

## Automatic (preselected)

The frontend will create and manage the recommended folder structure for you.

- Visual Pinball Library Folder input

Go next Button:
- Create folders

## Custom

Use your own existing folder structure.

- Tables folder input
- ROMs folder input

suggested folder structure:
Visual Pinball/
  Tables/
  VPinMAME/
    roms/

# Step 4 — Configure ROM Support in VPX
1. Launch VPX
2. Open any ROM-based table
3. Press `F12` to open pause menu
4. Open: `Plugin settings → PinMAME`
5. Set PinMAME path to `[deduced pinmame path from roms path]` [Copy ROM Path button]

Buttons:
- if no tables in library -> Import Tables button
- Launch VPX (opens random table if tables are in library)
- Finish

screenshots:
1. VPX settings
2. VPX plugins
3. VPX pinmame settings