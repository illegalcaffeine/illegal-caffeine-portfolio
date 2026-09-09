# English / Korean copy editing

The two languages are now stored independently.

- English: `src/i18n/en.ts`
- Korean: `src/i18n/ko.ts`

The strings passed to `t(...)` are lookup keys. Do **not** rename those keys when changing wording.
Change only the value in the language file you want to edit.

Example:

```ts
// en.ts
"you just found": "WELCOME TO",

// ko.ts
"you just found": "당신이 찾던",
```

Changing one language value does not modify the other language. The EN / KO switch and saved language choice are unchanged.
