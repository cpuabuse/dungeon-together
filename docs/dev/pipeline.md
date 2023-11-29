# Build, environment, pipeline

## Build

### Purposes

Purpose | Description
--: | ---
release | Build for release
debug | Build for development
test | Build for testing

### Types

Type | Description
--: | ---
client | Client build
server | Server build
standalone | Standalone build

## Environment

### Runtime

Runtime | Build | Description
--: | --- | ---
browser | client<br>standalone
deno | client (headless)<br>server<br>standalone
node | client (headless)<br>server<br>standalone

### Deployment

Build name format is `{{ build_purpose }}:{{ build_type }}:{{ runtime }}`.

Tier | Builds | Description
---: | --- | ---
local | run:client:browser<br>run:standalone:browser<br>run:server:deno<br>run:server:node<br>test:client:deno<br>test:client:node<br>test:server:deno<br>test:server:node<br>test:standalone:deno<br>test:standalone:node | Local development
test | test:client:deno<br>test:client:node<br>test:server:deno<br>test:server:node<br>test:standalone:deno<br>test:standalone:node | Pipeline
stg | run:client:browser<br>run:standalone:browser<br>run:server:deno<br>run:server:node | Github pages
prd | run:client:browser<br>run:standalone:browser<br>run:server:deno<br>run:server:node | Github pages

---

**NOTE**: Client tests run server both natively and in docker.