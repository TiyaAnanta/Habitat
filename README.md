# Habitat 🔥

A gamified daily habit streak tracker built with React Native + Expo. Track your DSA practice, web development, reading, workouts, and anything else — all in one place.

## Features

- **Daily check-ins** with streak tracking per quest
- **XP system** with levels (Novice → Mythic) and importance-based multipliers
- **Analytics** with streak history charts and weekly check-in bar graphs
- **Goal management** — set written goals per quest, mark them done
- **Time-bound quests** — assign durations (1 week to 1 year) with progress timelines
- **Undo check-ins** — unchecking today's entry removes the XP correctly
- **Protected quests** — quests can only be permanently deleted from the Goals tab, never accidentally from daily view
- **Haptic feedback** on check-ins

## Project Structure

```
habitat/
├── App.js                          # Entry point
├── app.json                        # Expo config
├── eas.json                        # EAS Build config (for APK)
├── package.json
├── babel.config.js
├── assets/                         # App icons, splash screen
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── context/
    │   └── AppContext.js           # Central state: quests, XP, check-in history
    ├── hooks/
    │   └── useStorage.js           # AsyncStorage persistence layer
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs + stack navigator
    ├── screens/
    │   ├── HomeScreen.js           # Daily check-in view
    │   ├── AnalyticsListScreen.js  # Quest picker for analytics
    │   ├── QuestDetailScreen.js    # Charts, stats, goals per quest
    │   └── GoalsScreen.js          # Quest manager (create/delete/configure)
    ├── components/
    │   ├── XPHeader.js             # XP bar with rank display
    │   ├── QuestCard.js            # Individual quest card with check-in button
    │   ├── StatCard.js             # Stat display (streak, consistency, etc.)
    │   ├── GoalItem.js             # Goal checkbox with delete
    │   └── Toast.js                # Animated toast notifications
    └── utils/
        ├── constants.js            # Titles, icons, colors, milestones
        ├── helpers.js              # Date math, streak calc, chart data
        └── theme.js                # Colors, spacing, typography tokens
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for APK builds): `npm install -g eas-cli`
- Expo Go app on your phone (for development)

### Install and Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/habitat.git
cd habitat

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera (iOS) to run on your phone.

## Building the APK

### Option 1: EAS Build (Recommended — builds in the cloud)

```bash
# Log in to your Expo account (create one at expo.dev if needed)
eas login

# Build the APK (runs on Expo's servers, no local Android SDK needed)
eas build -p android --profile preview
```

This takes ~10 minutes. When done, EAS gives you a download link for the `.apk` file. Install it directly on your Android phone.

### Option 2: Local Build (requires Android SDK)

```bash
# Generate the android/ folder
npx expo prebuild --platform android

# Build the APK
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## App Assets

Icons live in `assets/` and are already generated (flame mark on the `#1a1340` background):

- `icon.png` — 1024×1024 app icon
- `adaptive-icon.png` — 1024×1024 foreground for Android adaptive icons
- `splash.png` — 1284×2778 splash screen

To replace them, keep the same filenames and dimensions. [icon.kitchen](https://icon.kitchen) is handy for generating a set.

## How XP Works

| Streak Length | Base XP per Check-in |
|---------------|---------------------|
| Days 1–6      | 5 XP                |
| Days 7–13     | 10 XP               |
| Days 14–29    | 15 XP               |
| Days 30+      | 25 XP               |

Base XP is multiplied by the quest's importance weight (1x Normal, 2x Important, 3x Critical). Completing all quests in a day earns a +10 XP bonus.

## Customization

- Edit `src/utils/constants.js` to change titles, milestones, colors, or icons
- Edit `src/utils/theme.js` to change the design tokens
- Edit `src/context/AppContext.js` to change the default quests

## License

MIT
