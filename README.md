# Playful Generators

Playful Generators is a local-first mobile app that turns user-created idea libraries into randomized activities. It includes Spin the Wheel, What/Where/When, and Caveat Generator. Libraries, entries, theme preferences, and repeat settings are stored locally with SQLite; no account, backend, or AI service is required. Libraries can also be imported from and exported to versioned JSON files.

## Instructions for Build and Use

Steps to build and/or run the software:

1. Install Node.js 22.13 or newer and npm, then clone or download this repository.
2. From the project directory, run `npm install`.
3. Run `npm start` to launch the Expo development server.
4. Press `a` for Android, `w` for web, or scan the QR code with an Expo Go build compatible with Expo SDK 57. On a physical iPhone, sign in to the same Expo account in Expo Go and Expo CLI with `npx expo login`.
5. Optional verification commands are `npm test`, `npm run lint`, `npm run typecheck`, and `npx expo-doctor`.

Instructions for using the software:

1. Open **Libraries** and create a library. Choose Wheel, What, Where, When, or Caveat as its fixed type, then add entries.
2. Open **Make** and choose Spin the Wheel, What/Where/When, or Caveat Generator. Select the required populated libraries and generate a result.
3. Use **Settings** to select System, Light, or Dark appearance and configure immediate-repeat avoidance.
4. Open a library to edit its details and entries or export it as JSON. Use **Import JSON** to validate and preview a compatible file before saving it.

The JSON schema and validation limits are documented in [docs/library-format.md](docs/library-format.md).

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

* Node.js 22.13 or newer; the project was verified with Node.js 24.17.
* Expo SDK 57.0.30, React Native 0.86.3, React 19.2.3, and TypeScript 6.0.3.
* Expo Router 57.0.28 for file-based navigation in `src/app/`.
* Expo SQLite 57.0.4 for local persistence, plus Expo DocumentPicker, FileSystem, and Sharing for JSON transfer.
* Jest 30 for generator, schema, validation, and repository tests.
* Expo Go compatible with SDK 57, an Android/iOS simulator, or a web browser.

## Useful Websites to Learn More

I found these websites useful in developing this software:

* [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/)
* [Expo Router introduction](https://docs.expo.dev/router/introduction/)
* [Expo SQLite documentation](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/)
* [React Native documentation](https://reactnative.dev/docs/getting-started)
* [Jest documentation](https://jestjs.io/docs/getting-started)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [ ] Complete hands-on acceptance testing across physical iOS and Android devices, small screens, and software keyboards.
* [ ] Add automated component and end-to-end tests for navigation, forms, imports, exports, and accessibility behavior.
* [ ] Configure EAS development and production build profiles when the app is ready for external distribution.
