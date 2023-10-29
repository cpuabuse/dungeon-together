# Dev notes

- `io-ts` library is imported as a namespace intentionally, to minimize confusion
- Should carefully use `finally` in universe object hooks, since `finally` seems to execute after all of `then`s

## Vue

- All Vue components should be aware of the fact that their container might have pointer events disabled, and reenable them when necessary
- Vue components and structures should generally be defined and passed around as soon as data is available, rather than data be aggregated and centrally interpreted
- For non-primitive values, prefer shallow refs for local use, comment reason for full ref