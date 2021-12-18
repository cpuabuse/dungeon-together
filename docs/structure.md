# Project structure

## Tree

```bash
Project root
├───.vscode # VS Code configuration files
├───build # Build
│   ├───release # Release environment
│   │   ├───artifacts # Release artifacts
│   │   ├───bin # Release build binaries
│   │   ├───client # Client release for publishing
│   │   └───server # Server release for NPM
│   ├───stage # Stage environment 
│   │   ├───artifacts # Stage artifacts
│   │   ├───bin # Stage build binaries
│   │   ├───client # Stage client build
│   │   ├───server # Stage server build
│   │   └───standalone # Stage standalone build
│   └───test # Test build environment
├───script # Pipeline and initialization scripts
├───src # Source
│   ├───app # App - server and client
│   ├───docs # Documentation
│   ├───html # Standalone client HTML files
│   ├───img # Images
│   ├───rollup # Source for rollup binaries(build)
│   └───script # Source for build scripts
├───test # Test files
└───tsconfig # TS build configuration
```

## Source tree structure

`app` contents to be separated into folders, by software meaning. Each respective folder, would either contain files, or folders for directory imports.