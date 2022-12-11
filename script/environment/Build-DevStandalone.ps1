#!/usr/bin/env pwsh

npx mkdirp "build/dev/standalone"

# CSS
npx mkdirp build/dev/standalone/css/hljs
npx ncp node_modules/highlight.js/styles/a11y-dark.css build/dev/standalone/css/hljs/a11y-dark.css
npx ncp node_modules/highlight.js/styles/a11y-light.css build/dev/standalone/css/hljs/a11y-light.css

# HTML
npx mkdirp build/dev
npx ncp src/html build/dev/artifacts
npx replace-in-file js/index.js src/main/standalone.js build/dev/artifacts/index.html
npx ncp build/dev/artifacts/index.html build/dev/standalone/index.html

# Assets
npx tsc --project "tsconfig/dev/script.json"
npx rollup build/dev/artifacts/script/build-assets.dev.standalone.js -o build/dev/bin/script/build-assets.dev.standalone.js
node "build/dev/bin/script/build-assets.dev.standalone.js"

# JS
npx tsc --project tsconfig/dev/rollup.json
npx rollup --config build/dev/bin/rollup/dev.standalone.js --watch