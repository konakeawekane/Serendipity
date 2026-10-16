# Playful Generators

A local-first Expo app that turns user-owned idea libraries into randomized activities. It includes Spin the Wheel, What/Where/When, and Caveat Generator without accounts, cloud services, or an AI API.

## Requirements

- Node.js 22.13 or newer (developed with Node 24.17)
- npm 11 or newer
- The current App Store version of Expo Go or a compatible Android/iOS simulator
- For Expo Go on a physical iPhone, the same Expo account signed in on the phone and in Expo CLI

## Setup and run

```sh
npm install
npx expo login
npm start
```

Then sign in to that account in Expo Go, scan the QR code, or use the terminal shortcuts. On Windows, Android and web are available locally; native iOS builds require macOS, though Expo Go can open the project on an iOS device.

Useful commands:

```sh
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
npm test
```

## Architecture

- Routes and screens: `src/app/`
- Reusable UI and semantic theme: `src/components/`, `src/theme/`
- Pure generator logic: `src/features/generators.ts`
- Domain types and validation: `src/types/`, `src/domain/`
- SQLite migrations/repository: `src/db/`
- Import/export parsing and platform file actions: `src/features/import-export/`

`expo-sqlite` stores libraries, entries, and settings in `playful-generators.db`. Foreign keys and WAL mode are enabled. Screens call the repository through `AppDataProvider`; they do not run SQL.

## Data format

Imports and exports contain exactly one version-1 library. Imports are size-limited, parsed, validated, previewed, and only saved after confirmation. New IDs are generated transactionally to prevent collisions. See [docs/library-format.md](docs/library-format.md).

## Implementation decisions

- The project targets Expo SDK 57 because the App Store version of Expo Go does not yet support SDK 58.
- Web output uses Expo Router's client-only `single` mode because this local-first app has no server routes and its SQLite provider is browser-only.
- Empty libraries are allowed; no sample content is silently installed.
- Library metadata uses explicit Save; entry changes save per action.
- Haptics are omitted because they are optional and were not otherwise required.
- Import defaults: 1 MB maximum and 2,000 entries; text limits follow the implementation plan.
- SQLite is also configured for Expo web’s WASM requirement.
- Repository and pure-logic tests use Jest 30; it is excluded from Expo CLI's dependency-version validation.

## Known limitations

- The linked Figma file was not accessible from the implementation environment, so styling follows the written paint-splatter brief.
- Native file pick/share flows and iOS/Android small-screen behavior still require hands-on device acceptance testing.
- Web exports use a browser download; native platforms use the share sheet.
