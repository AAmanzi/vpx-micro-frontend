
Android Support – Design & Behavior
Overview

Android support is implemented as a stateless reconciliation system.

The app does not persist Android file state. Instead, it:

Stores user intent (which tables should be on Android)
Fetches actual state from the Android device when connected
Computes differences dynamically

==========

Core concept

1. User will manage which table he wants for android, like managing favorites
2. A new tab is added for viewing tables user wants for android
3. Within the new tab there will be a button to connect + scan android web server
4. App will compare user intent to android web server results and user will be
able to manage android library there

==========

A new flag wantOnAndroid for the Table model
it should be as toggling favorites

I could also add a new tab for table view to display android tables
If you don't use android, you can turn that view off in settings

So when user goes to the android tab it could try to connect automatically
to the previously saved path and if unsuccessful, display retry with input for location

After connecting, it can display tables -- tables can be split into 3 parts:

1. tables that should be on android, but aren't yet
2. tables that shouldn't be on android, but are
3. tables that should be on android and are

==========

Actions:

1. tables that should be on android, but aren't yet
For these, user will be able to upload them all with one button to android

2. tables that shouldn't be on android, but are
For these, user will be able to telede them all with one button from android

3. tables that should be on android and are
Just a preview of tables and their respective roms

⚠️ I'm currently unsure if I want to support when vpx file is on android, but rom isn't

==========

API EXAMPLES:
- http://192.168.0.65:2112/delete?q=images%2Fquicksil.zip DELETE

- http://192.168.0.65:2112/upload?offset=0&q=images%2Ffathom.zip POST

- http://192.168.0.65:2112/files?q=images GET
returns
[ { "name": "android-logo-mask.png", "ext": "png", "isDir": false, "size": 12104 }, { "name": "android-logo-shine.png", "ext": "png", "isDir": false, "size": 88700 }, { "name": "clock_font.png", "ext": "png", "isDir": false, "size": 12142 }, { "name": "progress_font.png", "ext": "png", "isDir": false, "size": 17515 }, { "name": "fathom.zip", "ext": "zip", "isDir": false, "size": 17591 } ]

==========

Settings must have android config now

androidConfig: {
  isActive: boolean
  webServerUrl: string
  tablesPath: string   // default: "tables"
  romsPath: string     // e.g. "pinmame/roms"
}

==========

Matching rule (add to docs)
existsOnAndroid =
  androidFiles.some(f => f.name === table.vpxFile)
