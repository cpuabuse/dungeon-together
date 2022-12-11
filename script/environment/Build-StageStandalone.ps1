#!/usr/bin/env pwsh

npx mkdirp "build/stage/standalone"

npm run build:stage:standalone:css
npm run build:stage:standalone:html
npm run build:stage:standalone:js

# Assets
npx tsc --project "tsconfig/stage/script.json"
node "build/stage/bin/script/build-assets.stage.standalone.js"