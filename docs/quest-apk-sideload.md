# SideQuests APK for Meta Quest via SideQuest

## Recommended architecture

The current SideQuests project is a Next.js application with server-rendered pages, `/api/account`, `/api/mangadex`, and remote TMDB/MangaDex/provider requests. The practical packaging route is a **Capacitor Android shell** that opens the deployed HTTPS SideQuests site inside an Android WebView. This produces a normal Android APK that can be installed on a Meta Quest as a 2D app. It does not turn the web UI into an immersive OpenXR/Unity VR experience.

Because the current app uses server APIs and dynamic routes, do not assume that a plain static export will preserve the complete application. Deploy the Next.js server first, then configure the Capacitor shell to load that HTTPS URL.

## Build the APK

From the SideQuests project root, install Capacitor and create the Android platform:

```bash
npm install @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init "SideQuests" "net.arnavrana.sidequests"
npx cap add android
```

Set the generated `capacitor.config.ts` to use the deployed site. Keep `webDir` pointed at a small existing web directory required by the project, while `server.url` points to the live Next.js deployment:

```ts
import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "net.arnavrana.sidequests",
  appName: "SideQuests",
  webDir: "out",
  server: {
    url: "https://YOUR-SIDEQUESTS-DOMAIN.example",
    cleartext: false,
  },
}

export default config
```

The deployed URL must be HTTPS and must expose the Next.js APIs used by the app. Then synchronize and build:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is normally written to `android/app/build/outputs/apk/debug/app-debug.apk`. Android Studio can also open the `android` directory and create the APK through **Build → Build APK(s)**. Capacitor documents the build sequence as web build, `npx cap sync`, and native compilation with `npx cap build android` or Android Studio.[1]

## Enable Quest development mode

Before installation, join or create a developer team in the Meta Horizon Developer Dashboard, verify the Meta account, and enable **Developer Mode** in the Meta Horizon mobile app under the paired headset’s settings. Connect the headset with a USB-C data cable, accept the USB debugging prompt inside the headset, and choose **Always allow from this computer**. Meta states that developer mode authorizes installation and debugging of builds from outside the Meta Horizon Store.[2]

## Install with SideQuest

Install the SideQuest Desktop Advanced Installer, connect the headset, confirm the green connection indicator, and drag `app-debug.apk` onto the SideQuest window or use its **Install APK file from computer** action. SideQuest’s setup page describes the Desktop App as supporting APK/OBB installation; the installed app can then be found on the headset under **Apps → Unknown Sources**.[3]

For a command-line alternative, with USB debugging authorized:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Online-only behavior

The delivered SideQuests build intentionally has **no offline downloads, offline vault, IndexedDB media cache, or offline reader**. Movies, TV shows, anime, and manga load online through the configured APIs and streaming providers. Watch history, reading progress, and account synchronization are application data features; they do not download or repackage media.

The APK is therefore an online client. It requires an internet connection and a deployed HTTPS SideQuests server for server-rendered routes and `/api/account` and `/api/mangadex`. Do not attempt to cache or redistribute third-party streams without the necessary rights.

## References

[1]: https://capacitorjs.com/docs/basics/workflow "Capacitor Workflow"
[2]: https://developers.meta.com/horizon/documentation/native/android/mobile-device-setup/ "Meta Horizon OS: Device Setup"
[3]: https://sidequestvr.com/setup-howto "SideQuest: Get SideQuest"
