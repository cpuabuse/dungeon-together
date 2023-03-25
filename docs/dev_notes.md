# Dev notes

- `io-ts` library is imported as a namespace intentionally, to minimize confusion
- Should carefully use `finally` in universe object hooks, since `finally` seems to execute after all of `then`s