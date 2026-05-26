# HowMyLook

Mobile-first Next.js app for fast yes/no outfit feedback.

## App scripts

```bash
npm run dev
npm run build
npm run lint
```

## Android wrapper setup

This repo now includes a Capacitor-based Android wrapper for the hosted site.

### Current Android mode
- App name: `HowMyLook`
- Package id: `com.howmylook.app`
- Wrapper target: `https://howmylook.com`
- Approach: hosted live-site wrapper, not bundled static web assets

That means:
- the Android app requires internet access
- website deploys update app behavior immediately
- APK rebuilds are only needed for native shell changes like icons, splash, permissions, plugins, or package settings

### Installed Capacitor packages
- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`

### Useful scripts
```bash
npm run cap:sync
npm run cap:copy
npm run cap:open:android
```

### Important environment note
This workspace was running with `NODE_ENV=production`, which caused npm to omit devDependencies unless installed with `--include=dev`.
Capacitor needs local TypeScript available because the project uses `capacitor.config.ts`.

If Capacitor ever says it cannot find TypeScript, run:

```bash
npm install --include=dev
```

### Repo-specific sync note
For this hosted-wrapper setup, Capacitor sync expected the Android assets path to exist.
The working path is:

```bash
android/app/src/main/assets/public
```

Once that path exists, this works:

```bash
npm run cap:sync
```

### Verified so far
- Capacitor dependencies installed
- Android platform added under `android/`
- `npm run cap:sync` succeeds
- Next.js production build succeeds

### Not yet verified on this machine
Native Gradle/APK build is currently blocked by missing Java tooling:
- `JAVA_HOME` is not set
- no `java` binary is available in PATH

To continue to real APK builds, install:
- Java JDK
- Android Studio
- Android SDK

Then run:

```bash
npm run cap:open:android
```

or from CLI once Java/SDK are present:

```bash
./android/gradlew -p android assembleDebug
```

## Suggested next Android tasks
1. Install Java + Android Studio on the machine used for builds
2. Open the Android project in Android Studio
3. Replace default Capacitor launcher/splash assets with HowMyLook branding
4. Build and install a debug APK
5. Test sign in, rating flow, upload, safe areas, keyboard behavior, and notifications
