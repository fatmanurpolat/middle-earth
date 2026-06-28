# @middleearth/i18n

Locale resources for **MiddleEarth-Klip**, ready to feed into
[i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/).

This package exports the raw translation `resources` object plus a few helper
constants. It does **not** initialize i18next itself — each frontend app
(`@middleearth/landing`, `@middleearth/dashboard`) owns its own
`i18next.init(...)` call so it can wire up its own React bindings, language
detector, and storage.

## Public API

```ts
import {
  SUPPORTED_LOCALES, // ['en','tr','pt'] as const
  DEFAULT_LOCALE,    // 'en'
  LOCALE_LABELS,     // { en:'English', tr:'Türkçe', pt:'Português' }
  resources,         // { en:{translation}, tr:{translation}, pt:{translation} }
  en, tr, pt,        // the raw locale JSON objects
} from '@middleearth/i18n';

import type { AppLocale } from '@middleearth/i18n'; // 'en' | 'tr' | 'pt'
```

### Wiring it into an app

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@middleearth/i18n';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE, // 'en'
    supportedLngs: SUPPORTED_LOCALES, // ['en','tr','pt']
    interpolation: { escapeValue: false },
    detection: {
      // persist the chosen language under this exact key
      lookupLocalStorage: 'me_lang',
      caches: ['localStorage'],
    },
  });
```

> The shared **localStorage key** for the selected language is `me_lang`.
> Keep this identical across every frontend so the language choice carries
> over between the landing site and the dashboard.

## Locale structure

Each locale lives in `src/locales/<lang>.json`. All three files share an
**identical key tree** — every key present in `en.json` must also exist in
`tr.json` and `pt.json`. Interpolation placeholders use the `{{name}}` syntax.

Top-level namespaces (single `translation` namespace, nested groups):

| Group         | Purpose                                                         |
| ------------- | -------------------------------------------------------------- |
| `common`      | App-wide UI: app name, tagline, loading/error, language labels |
| `landing`     | Marketing site: nav, hero, artifact, lore, the four ages, cta  |
| `auth`        | The Doors of Durin login flow + the _mellon_ phrase            |
| `characters`  | `title`/`tagline` for all 9 characters                         |
| `dashboard`   | Welcome copy, per-character greetings, fan meter, books, profile |

`characters.*` and `dashboard.greeting.*` both cover all nine character ids:
`gandalf`, `legolas`, `saruman`, `aragorn`, `gimli`, `sam`, `frodo`,
`boromir`, `gollum`.

### The "mellon" phrase

The Doors of Durin prompt is fixed per language and intentionally **not** a
literal translation — it preserves the in-world riddle ("Speak, friend, and
enter"). It appears as both `auth.mellonPhrase` and `auth.enterButton`:

| Locale | `auth.mellonPhrase` / `auth.enterButton` |
| ------ | ---------------------------------------- |
| `en`   | `Speak 'Mellon' and Enter`               |
| `tr`   | `Dost de ve Öyle Gir`                    |
| `pt`   | `Diga 'Mellon' e Entre`                  |

The inscription `auth.inscription` is the same Sindarin line in every locale:
`Ennyn Durin Aran Moria: pedo mellon a minno`.

## Adding a new language

1. Add the two-letter code to `SUPPORTED_LOCALES` in `src/index.ts`.
2. Add a human-readable label to `LOCALE_LABELS` (in its own language, e.g.
   `Türkçe`, `Português`).
3. Add the same label key under `common.languages` in **every** locale file.
4. Copy `src/locales/en.json` to `src/locales/<lang>.json` and translate every
   value, keeping the key tree byte-for-byte identical.
5. Import the new JSON in `src/index.ts` and add it to `resources` as
   `{ translation: <lang> }`, and to the re-export list.
6. Run `npm run typecheck` to confirm the package still compiles.

### Keeping locales in sync

The three locale files must stay structurally identical. A quick check with
[`jq`](https://jqlang.github.io/jq/):

```sh
# compare the sorted key paths of two locales — output should be empty
diff \
  <(jq -r 'paths(scalars) | join(".")' src/locales/en.json | sort) \
  <(jq -r 'paths(scalars) | join(".")' src/locales/tr.json | sort)
```

## Type-checking

```sh
npm run typecheck   # tsc --noEmit, honors the repo tsconfig paths
```

This package ships **TypeScript source** (`main`/`types`/`exports` all point at
`./src/index.ts`); consumers resolve it via tsconfig `paths` and Vite
`resolve.alias`. There is no build step.
