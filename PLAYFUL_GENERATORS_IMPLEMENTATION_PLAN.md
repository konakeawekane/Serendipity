# Playful Generators --- Expo Implementation Plan

**Purpose:** This is the handoff brief for Codex to build a functioning
local-first mobile app with React Native, Expo, TypeScript, and VS Code
from a scratch directory. Treat it as the product/engineering contract.
It describes intended behavior; it does not claim the app has already
been implemented.

## 1. Product summary

Build a playful app that turns user-supplied ideas, interests, and
commitments into randomized activities. The user fuels the app with
their own content. The generators select, combine, or add constraints;
they should not require an AI API or continuously inject ideas.

### Core principles

-   **User-owned content first:** users create and manage their own
    libraries. Optional sample libraries can come later.
-   **Local-first:** the MVP works offline without accounts, a backend,
    or an AI API.
-   **Simple commitments:** Caveat Generator accepts plain text; it is
    not a habit tracker, calendar, task manager, or recurring commitment
    system.
-   **Pure generator logic:** random selection is independent of UI and
    persistence.
-   **Safe imports:** imported JSON is untrusted data. Parse, validate,
    preview, then save. Never execute imported content.
-   **Functional before fancy:** correctness, persistence, and error
    handling precede elaborate animations.
-   **Clean UI:** do not place developer notes, TODOs, design rationale,
    or commentary in user-facing screens.

## 2. The three generators

### Spin the Wheel

Select one random entry from a user-owned `wheel` library. Users can
add/edit/delete entries, spin again, and optionally avoid immediately
repeating the previous entry. - Empty library: explain what is missing,
provide an Add entries action, disable Spin. - One entry: return it; do
not loop while trying to avoid a repeat. - Multiple entries with repeat
avoidance enabled: exclude the previous entry ID when possible. -
Deleting the selected entry clears or safely replaces the result. - The
random selection logic is the source of truth. If adding a wheel
animation, select the result first and animate to it; animation must not
determine the result.

### What, Where, When

Combine one entry from each of three user-owned library types: `what`,
`where`, and `when`. - Provide selectors if multiple libraries of a type
exist. - Show three color-coded result cards. - Generation is
unavailable until each category has at least one entry. - Show a
distinct empty state and direct action for every missing category. -
Repeat avoidance is independent per category. - `when` is user-authored
text, not necessarily a clock time or date. - Keep the result structured
as `{ what, where, when }`. Saved plans are optional future work.

### Caveat Generator

The user enters an existing commitment and the app adds a random caveat
that changes *how* the commitment is done, making it more interesting
without undermining the goal.

Example: "Study for my biology exam" + "Explain each major concept aloud
as if teaching a beginner."

Requirements: - Plain-text commitment input. - Choose a user-owned
`caveat` library. - Display commitment plus selected caveat. - Generate
another caveat and allow rejection/retry. - Empty commitment and empty
caveat library are handled clearly. - Changing the commitment clears or
marks the previous result stale. - Commitment remains ephemeral text by
default; do not add streaks, due dates, notifications, completion
tracking, or task records. - Caveats should not sabotage the core
commitment (for example, "study less" for an exam), and should avoid
unsafe, humiliating, illegal, coercive, or financially risky
challenges. - Keep the product name **Caveat Generator**.

## 3. Visual direction

The style is a playful paint-splatter notebook: bright, informal,
energetic, slightly chaotic, but readable.

Starter palette (adjust to match the current Figma frames when
available; these values are not a claim of exact Figma parity):

``` ts
export const palette = {
  background: "#FFF9F0",
  surface: "#FFFFFF",
  text: "#24202B",
  mutedText: "#6E6875",
  border: "#E9DFE7",
  pink: "#FF4FA3",
  blue: "#3E7BFA",
  yellow: "#FFD84D",
  orange: "#FF8748",
  lime: "#B9E64A",
  darkBackground: "#19151F",
  darkSurface: "#282230",
  darkText: "#FFF8F1",
};
```

Suggested accents: Spin = pink/yellow; What/Where/When = a distinct
color for each category; Caveat = orange/blue. Use rounded cards,
informal bold typography, sticker-like primary buttons, hand-drawn SVG
splatters, stars and scribbles. Keep decoration behind content and away
from touch targets.

UI rules: - Use Flexbox, spacing tokens, safe areas, and scrollable
layouts; do not translate Figma coordinates literally. - Use semantic
theme tokens rather than hard-coding colors in every component. - Keep
text contrast and touch targets usable. Do not convey meaning by color
alone. - Support long labels, keyboard behavior, smaller screens,
disabled/pressed states, and useful empty/error states. - Dark mode must
be designed intentionally, not produced by blindly inverting colors. -
Do not add visual controls that do not work.

Reusable components to consider: `ScreenContainer`, `AppHeader`,
`PrimaryButton`, `SecondaryButton`, `ColorfulCard`, `InputField`,
`EmptyState`, `LibraryCard`, `LibraryEntryRow`, `GeneratorResultCard`,
`TypePill`, and a decorative `PaintSplatter`/`DecorationLayer` using
`react-native-svg`. Avoid unnecessary abstractions.

## 4. Figma screen inventory and navigation

Figma file: https://www.figma.com/design/eEYPswJMrWkWvDvufXBLPT\
Page: `Mobile Wireframes`. Known static frames: 1. Make a plan --- node
`1:2` 2. Spin the Wheel --- node `1:33` 3. What, Where, When --- node
`1:59` 4. Caveat Generator --- node `1:92` 5. Your libraries --- node
`1:122` 6. Weekend ideas (library detail/editor) --- node `1:161` 7.
Import library --- node `1:199` 8. Settings --- node `5:40`

These are static wireframes, not a connected prototype. If Codex can
access Figma, inspect the current frames/screenshots before final
styling. If Figma is inaccessible, continue using this brief; do not
block implementation or invent unseen details.

Use Expo Router. Recommended bottom tabs: **Make**, **Libraries**,
**Settings**. Generator/editor/import screens are stack routes.

  Screen                  Logical route
  ----------------------- ---------------------
  Make a plan             `/(tabs)/index`
  Spin the Wheel          `/spin`
  What, Where, When       `/what-where-when`
  Caveat Generator        `/caveat`
  Your libraries          `/(tabs)/libraries`
  Library detail/editor   `/library/[id]`
  Import library          `/import-library`
  Settings                `/(tabs)/settings`

The exact file layout depends on the generated Expo template. Inspect it
first. Expo Router route files belong in the configured route directory
(`app/` or `src/app/`, not both). Non-route code should live elsewhere.
Home cards navigate to generators; library cards open editors; Import
opens the import flow; back navigation works. Avoid dead buttons and
obsolete starter routes.

## 5. Stack and architecture

Required: React Native, Expo, TypeScript, Expo Router. Use
`react-native-svg` for scalable decorations and optionally a wheel
graphic. Use one local persistence system.

**Recommended default:** Expo SQLite, if compatible with the installed
Expo SDK. Keep it behind a repository interface. AsyncStorage is
acceptable for a very small prototype, but do not use both SQLite and
AsyncStorage for the same domain data.

Separate: 1. Screens/UI. 2. Feature/generator logic. 3. Domain types and
validation. 4. Persistence repository. 5. Import/export. 6. Theme/design
system.

Screens should not run SQL. Generator functions must not import React,
Expo Router, or storage. Import/export validates data before calling the
repository. Start with React state and small contexts/hooks; do not add
Redux/Zustand without a concrete need.

Suggested structure (adapt to the Expo template while preserving
boundaries):

``` text
playful-generators/
├── app.json
├── package.json
├── tsconfig.json
├── README.md
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   └── library-format.md
├── assets/
└── src/
    ├── components/
    ├── features/
    │   ├── wheel/
    │   ├── what-where-when/
    │   ├── caveat/
    │   ├── libraries/
    │   ├── import-export/
    │   └── settings/
    ├── db/
    │   ├── database.ts
    │   └── migrations.ts
    ├── theme/
    │   ├── colors.ts
    │   ├── spacing.ts
    │   ├── typography.ts
    │   └── ThemeProvider.tsx
    ├── types/
    └── utils/
```

Expo Router route files can remain in root `app/` while non-route
modules live under `src/`. Avoid configuring two route roots.

## 6. Domain model

``` ts
export type LibraryType =
  | "wheel"
  | "what"
  | "where"
  | "when"
  | "caveat";

export type LibraryEntry = {
  id: string;
  text: string;
  createdAt?: string;
};

export type Library = {
  id: string;
  name: string;
  description?: string;
  type: LibraryType;
  entries: LibraryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type GeneratedPlan = {
  what: LibraryEntry;
  where: LibraryEntry;
  when: LibraryEntry;
  generatedAt: string;
};

export type ThemePreference = "system" | "light" | "dark";

export type AppSettings = {
  themePreference: ThemePreference;
  avoidImmediateRepeats: boolean;
  hapticsEnabled: boolean;
};
```

Mapping: `wheel` = Spin the Wheel; `what`, `where`, `when` = What,
Where, When categories; `caveat` = Caveat Generator. Support multiple
libraries per type; provide a selector. Each library has one fixed type.
Changing type later should require explicit conversion, not an
accidental edit.

Validation defaults (adjust if needed): trim strings; require a
non-empty library name and non-empty entry text; name max 80 characters,
description max 500, entry max 500; show validation errors rather than
silently truncating. Duplicated entry text is allowed. IDs must be
stable and unique; never use array indexes as IDs. Timestamps use ISO
strings. Validate at import and service boundaries.

Settings defaults: theme `system`, avoid immediate repeats `true`; only
expose haptics if fully implemented with a supported Expo API. Persist
preferences.

## 7. Versioned JSON format

Export exactly one library per JSON file for v1.

``` json
{
  "schemaVersion": 1,
  "library": {
    "id": "weekend-ideas",
    "name": "Weekend ideas",
    "description": "Activities to consider on a free weekend.",
    "type": "wheel",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "updatedAt": "2026-01-01T12:00:00.000Z",
    "entries": [
      { "id": "weekend-001", "text": "Visit a new neighbourhood" },
      { "id": "weekend-002", "text": "Cook something unfamiliar" }
    ]
  }
}
```

### Import flow

1.  Pick a JSON file with the Expo DocumentPicker API compatible with
    the installed SDK.
2.  Read the file with the supported FileSystem API.
3.  Parse in `try/catch`.
4.  Validate schema version, required fields, type, IDs, text, limits,
    and file size.
5.  Show preview (name, type, entry count, validation issues).
6.  Let user cancel or confirm; do not save before confirmation.
7.  Regenerate library and entry IDs on import to avoid collisions.
8.  Save transactionally; no partial imports.
9.  Report success or an actionable error. Cancellation is not an error.
10. Never execute imported strings or trust the file extension alone.

### Export flow

Serialize the selected library with `schemaVersion: 1`, use a safe
filename, and share/save via supported Expo APIs. Handle unsupported
sharing targets and cancellation. Never claim success until the platform
operation succeeds. Bulk ZIP export is out of scope.

### AI-assisted libraries later

Do not build an AI API into the MVP. Users may create JSON externally
using companion Markdown guides; the app's validator is the authority on
acceptance. Guides are documentation, not runtime dependencies.

## 8. Generator logic contracts

Keep generator functions pure. Accept an injectable random function for
deterministic tests. Do not mutate input arrays.

``` ts
export function pickRandomEntry(
  entries: LibraryEntry[],
  options?: {
    previousEntryId?: string;
    avoidImmediateRepeats?: boolean;
    random?: () => number;
  }
): LibraryEntry | null;
```

Rules: empty list returns `null`; a single item is returned even when
repeat avoidance is on; with 2+ entries, exclude the prior ID when
possible; clamp or reject invalid random values safely so indexes never
go out of range. Use IDs, not text, to identify repeats.

``` ts
export function generateWheelResult(
  entries: LibraryEntry[],
  previousEntryId?: string,
  avoidImmediateRepeats = true,
  random = Math.random
): LibraryEntry | null;
```

``` ts
export type WhatWhereWhenResult = {
  what: LibraryEntry;
  where: LibraryEntry;
  when: LibraryEntry;
};

export function generateWhatWhereWhen(input: {
  whatEntries: LibraryEntry[];
  whereEntries: LibraryEntry[];
  whenEntries: LibraryEntry[];
  previousIds?: { what?: string; where?: string; when?: string };
  avoidImmediateRepeats?: boolean;
  random?: () => number;
}): WhatWhereWhenResult | null;
```

Return `null` or a typed failure if any category is empty. UI must
distinguish which category is missing.

``` ts
export type CaveatResult = {
  commitment: string;
  caveat: LibraryEntry;
  generatedAt: string;
};

export function generateCaveat(
  commitment: string,
  caveatEntries: LibraryEntry[],
  previousCaveatId?: string,
  avoidImmediateRepeats = true,
  random = Math.random
): CaveatResult | null;
```

Trim the commitment. Blank input should be a clear validation error at
service/UI level; an empty caveat library returns no result. The
function should not otherwise rewrite the user's commitment. Selection
is the source of truth; animation must follow the selected result.

## 9. Persistence plan

If using SQLite, use migrations from the start. Suggested schema:

``` sql
CREATE TABLE IF NOT EXISTS libraries (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS library_entries (
  id TEXT PRIMARY KEY NOT NULL,
  library_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_library_entries_library_id
  ON library_entries(library_id);
```

Enable foreign keys if supported; use parameterized statements, never
SQL string interpolation for user content. Use transactions for
multi-step writes and imports. Test fresh install and child-entry
deletion. Implement repository functions: - `listLibraries()`,
`getLibraryById(id)`, `listLibrariesByType(type)` -
`createLibrary(input)`, `updateLibrary(id, input)`,
`deleteLibrary(id)` - `addEntry(libraryId, text)`,
`updateEntry(libraryId, entryId, text)`,
`deleteEntry(libraryId, entryId)` - `importLibrary(validatedLibrary)`,
`exportLibrary(id)`

Starter data is optional. Prefer useful empty states. If sample
libraries are added, label them as samples, let users remove them, and
never silently mix them with user content.

## 10. Screen specifications

### Make / Home

App identity, three prominent generator cards, short descriptions,
playful decorations, libraries access through tabs. No result generated
on initial render. Each card navigates correctly. Avoid unnecessary
onboarding, analytics, or account prompts.

### Spin

Header, `wheel` library selector, wheel/selection panel, Spin button,
result, spin-again action, shortcut to manage entries. Disable spin for
empty libraries. Update previous ID only after a successful result.
Reconcile results when library changes or selected entry is deleted.

### What, Where, When

Selectors for each type when needed, three color-coded result cards,
Generate button. Require all three categories to be populated. Track
previous IDs independently. Keep result structured and show a helpful
path to fix missing categories.

### Caveat

Commitment input, caveat library selector, Generate button, combined
result, Generate another action, empty-library path, blank-input
validation. Do not store commitment as a task. Generate again uses
current input/library. User can reject and retry.

### Libraries

List/group/filter by type, show name/type/entry count, create action,
import action, empty state. Support multiple libraries per type. Confirm
deletion. Refresh after CRUD/import. Provide retry for load errors.

### Library detail/editor

Name, optional description, fixed type, entry list, add/edit/delete
entry controls, export action, delete-library action with confirmation.
Trim/validate input; use stable IDs; support long text. Choose immediate
autosave with visible feedback or explicit save with unsaved-change
protection; do not lose edits silently.

### Create library

Name, type, optional description; optionally allow first entry. Empty
libraries are allowed. Prevent duplicate submission. After creation
return to list or open the new library.

### Import library

Pick file, preview valid metadata/count, show validation issues, Cancel
and Confirm. No save before confirmation. Handle malformed JSON,
unsupported version, invalid fields/types, oversized data, file read
errors, ID collisions, and cancellation.

### Settings

System/Light/Dark theme, repeat-avoidance toggle, haptics only if
functional, import/data actions and about/version if available. No
accounts/cloud sync/AI settings. Every visible control must work.

## 11. Theme, accessibility, and errors

Theme provider resolves `system` using `useColorScheme()`, otherwise
explicit light/dark palettes. Persist preference, not a stale resolved
OS color. Theme changes immediately; system preference tracks OS
changes.

Accessibility/usability: - Clear accessible labels/roles for controls. -
Readable type and contrast; color is never the only cue. - Safe areas,
keyboard avoidance/dismissal, long text, small screens. - Visible
disabled/pressed states and confirmation for destructive actions. -
Clear empty/error messages; no raw stack traces in user-facing UI. - No
false success feedback. - Handle database failures, invalid input,
malformed/unsupported JSON, file read/share failures, no compatible
libraries, empty entries, collisions, generator missing inputs, unsaved
edits, and OS theme changes. - Avoid logging sensitive commitment text
unnecessarily.

## 12. Testing

Use a test runner compatible with the installed Expo SDK (Jest with an
Expo preset is a reasonable choice if configuration is straightforward).

### Unit tests

-   Empty/single/multiple entry picker cases.
-   Deterministic random values and repeat avoidance.
-   Input arrays are not mutated.
-   Wheel result behavior.
-   What/Where/When complete and missing-category behavior.
-   Blank commitment and empty caveat behavior.
-   Library schema validation and text limits.
-   Malformed JSON, unsupported schema version, invalid record
    rejection.
-   Import ID regeneration.

### Repository/integration tests

-   Fresh database initialization.
-   Library/entry CRUD.
-   Delete library and child-entry behavior.
-   Import transaction atomicity.
-   Export schema correctness.
-   Settings persistence.
-   Invalid data cannot bypass validation.

Mock native file APIs where necessary.

### Manual acceptance checklist

1.  Clean install launches without crash.
2.  All tabs/routes work and back navigation is correct.
3.  Create a wheel library with at least three entries; spin repeatedly.
4.  Verify repeat avoidance on/off.
5.  Create What/Where/When libraries and generate a plan.
6.  Empty one category and verify generation is blocked helpfully.
7.  Enter a commitment and generate/regenerate caveats.
8.  Change commitment and verify regenerated result uses it.
9.  Create/edit/delete libraries and entries.
10. Import valid JSON via preview/confirm.
11. Import malformed JSON and verify no data is written.
12. Export and validate JSON.
13. Change theme through all modes and verify persistence.
14. Restart app and verify libraries/settings persist.
15. Test long text, empty states, small screens, keyboard, light/dark.
16. Test iOS and Android when feasible.
17. Run typecheck, lint, and tests before declaring completion.

## 13. Implementation phases and gates

Work in small increments. Keep the app runnable and run checks after
each phase.

### Phase 0 --- Inspect and initialize

-   Inspect directory; never overwrite blindly.
-   Check Node/npm and project prerequisites.
-   If empty, initialize Expo with TypeScript and Expo Router where
    supported.
-   Record SDK/package versions and confirm app boots. **Gate:** clean
    startup, TypeScript enabled, no unexplained template errors.

### Phase 1 --- Navigation

-   Set up Make/Libraries/Settings tabs.
-   Add placeholder routes for all generators, editor, import.
-   Remove/repurpose starter routes. **Gate:** all eight destinations
    reachable, no dead controls.

### Phase 2 --- Design system/screen shells

-   Add palette, semantic theme, spacing, typography, reusable
    components, SVG decoration.
-   Build all screen layouts with placeholder data.
-   Wire system/light/dark theme. **Gate:** consistent responsive UI,
    scrolling and theme work.

### Phase 3 --- Types/validation/generator logic

-   Add domain types, IDs, validation, versioned import schema, pure
    generators.
-   Add unit tests. **Gate:** edge cases covered, typecheck passes.

### Phase 4 --- Persistence

-   Add SQLite initialization/migrations or documented alternative.
-   Add repository/service layer and settings persistence.
-   Test CRUD, fresh install, and deletion. **Gate:** data survives
    restart; no SQL in screens.

### Phase 5 --- Library management

-   Build list, create, editor, entry CRUD, confirmation and empty/error
    states. **Gate:** user can manage all library types; changes
    persist.

### Phase 6 --- Spin

-   Connect selector, random logic, result and repeat preference.
-   Add animation only after logic works. **Gate:** correct behavior for
    empty/single/multiple entries; tests pass.

### Phase 7 --- What, Where, When

-   Add three selectors/results and independent repeat tracking.
    **Gate:** requires all categories and uses entries from selected
    libraries.

### Phase 8 --- Caveat

-   Add commitment input, caveat selector, combined result and
    regeneration. **Gate:** commitment is ephemeral; blank/empty states
    work.

### Phase 9 --- Import/export

-   Implement parse, validation, preview, confirmation, transactional
    import, export/share. **Gate:** invalid data cannot persist; valid
    export can be imported.

### Phase 10 --- Settings/accessibility/polish

-   Finish theme/repeat settings and optional haptics.
-   Compare with Figma if available; refine hierarchy, spacing, colors,
    type, decoration in that order. **Gate:** visible settings work, no
    major clipping, UI contains no developer commentary.

### Phase 11 --- Final verification/handoff

-   Run typecheck, lint, tests, manual acceptance checklist.
-   Remove unused dependencies/starter code.
-   Document run/test/data format and known limitations. **Gate:** a new
    developer can follow README to run the app; incomplete items are
    disclosed.

## 14. VS Code setup and commands

Open the intended directory in VS Code and use its integrated terminal.
Typical commands for a new nested project:

``` bash
npx create-expo-app@latest playful-generators
cd playful-generators
npx expo start
```

If the currently open directory is already the project root, do not
accidentally create a nested project. Inspect the CLI prompts and
resulting structure.

Before installing packages, inspect `package.json`; the template may
already include Expo Router. Use Expo's version-aware installer:

``` bash
npx expo install expo-router expo-sqlite
npx expo install expo-document-picker expo-file-system expo-sharing
npx expo install react-native-svg
```

Install only what is needed, and verify each package's compatibility
with the installed SDK. The APIs for file reading/sharing can change
across Expo SDK versions; use the current official docs rather than
copying old snippets. Use Expo Go if all selected APIs support it;
otherwise use a development build.

Set up and verify real scripts for `start`, `android`, `ios`, optional
`web`, `typecheck`, `lint`, and `test`. Do not leave scripts pointing to
tools that are not installed.

Official docs: - Expo: https://docs.expo.dev/ - Expo Router:
https://docs.expo.dev/router/introduction/ - Router concepts:
https://docs.expo.dev/router/basics/core-concepts/ - SQLite:
https://docs.expo.dev/versions/latest/sdk/sqlite/ - DocumentPicker:
https://docs.expo.dev/versions/latest/sdk/document-picker/ - FileSystem:
https://docs.expo.dev/versions/latest/sdk/filesystem/ - Sharing:
https://docs.expo.dev/versions/latest/sdk/sharing/ - Flexbox:
https://reactnative.dev/docs/flexbox - Appearance:
https://reactnative.dev/docs/appearance - Accessibility:
https://reactnative.dev/docs/accessibility

## 15. Explicit non-goals

Do not add these unless requested after the MVP works: - AI API or
in-app AI chat. - Accounts/authentication, backend, cloud sync. - Social
feed, followers, or collaboration. - Habit tracker, calendar, reminders,
completion tracking, streaks. - Gamification/points/achievements. -
Complex state library without demonstrated need. - Elaborate wheel
animation before selection is tested. - Bulk ZIP import/export. -
Analytics/ads. - Large mandatory built-in idea catalog.

## 16. Definition of done

-   [ ] App starts from documented setup.
-   [ ] All eight planned screens exist and are reachable.
-   [ ] Shared playful design system is applied.
-   [ ] System/light/dark theme works and persists.
-   [ ] Libraries and entries can be created, edited, deleted.
-   [ ] Spin selects from a user-owned wheel library.
-   [ ] What/Where/When combines the three correct types.
-   [ ] Caveat combines plain-text commitment with a user-owned caveat.
-   [ ] Repeat avoidance behaves as specified.
-   [ ] Empty/invalid states are handled.
-   [ ] Libraries/settings persist across restart.
-   [ ] JSON import previews and validates before saving.
-   [ ] JSON export works and matches schema.
-   [ ] Invalid imports never cause partial writes.
-   [ ] Core generator/validation tests exist and pass.
-   [ ] Typecheck/lint/configured tests pass.
-   [ ] Major layouts checked on target platform.
-   [ ] README covers setup, run, tests, storage, and file format.
-   [ ] Remaining limitations are disclosed.

## 17. Instructions to Codex

1.  Inspect the workspace before changing files.
2.  If empty, initialize the Expo project in the correct directory.
3.  Work phase by phase; do not make one giant unreviewable change.
4.  Keep the app runnable after each phase.
5.  Use current Expo-compatible packages/APIs and TypeScript.
6.  Inspect Figma if available; otherwise proceed from this brief
    without inventing Figma details.
7.  Add tests as pure logic is introduced.
8.  Do not leave visible controls that do nothing.
9.  Do not put developer notes/design rationale in the product UI.
10. Never claim a test/build passed unless it was actually run.
11. At each milestone, summarize files changed, behavior implemented,
    commands run, and known issues.
12. Ask only when a decision materially blocks progress; otherwise use
    the defaults here and document the choice.
13. Do not implement non-goals just because they are easy to add.

**First milestone:** verify/create the Expo project, establish
navigation for all eight screens, and build the shared design system
plus static screen shells. Confirm the app boots and navigation works
before implementing persistence or generator behavior.
