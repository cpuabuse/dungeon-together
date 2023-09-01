# Dev notes

- `io-ts` library is imported as a namespace intentionally, to minimize confusion
- Should carefully use `finally` in universe object hooks, since `finally` seems to execute after all of `then`s
- All Vue components should be aware of the fact that their container might have pointer events disabled, and reenable them when necessary