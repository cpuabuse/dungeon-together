# Dev notes

- `io-ts` library is imported as a namespace intentionally, to minimize confusion
- Should carefully use `finally` in universe object hooks, since `finally` seems to execute after all of `then`s
- Conditions on numbers should explain why, as it may be unintended

## Vue

- All Vue components should be aware of the fact that their container might have pointer events disabled, and reenable them when necessary
- Vue components and structures should generally be defined and passed around as soon as data is available, rather than data be aggregated and centrally interpreted
- For non-primitive values, prefer shallow refs for local use, comment reason for full ref
- Pinia stores should not be destructured, and be injected into component context and accessed as a whole
- For very general types and objects, prefix them with `app`, signifying it is originated from the app, to evade ambiguity (Instead of `Theme` use `AppTheme`)
- When working with translation functions, have to perform checks before doing operations onto returns, since they might not match type if translation was missing, like in arrays