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

- `app` - minimum functionality for the app
	```mermaid
	flowchart LR
		client --- vue
		server --- yaml
		core[common<br>core<br>comms] --- client & server --- application
	```
	- `application` - standard apps for fast initialization
	- `client` - client source
	- `common` - common shared libraries, unrelated to app itself
	- `comms` - client↔️server communication types
	- `server` - server source
	- `vue` - Vue GUI for client
		- `components` - Base components
		- `core` - Data shared between components
		- `pages` - Pages
		- `views` - Views
		Folders, containing components, should not contain subfolders; Respective index file should export necessary components only; Local imports should not use index file exports
	- `yaml` - source to deal with YAML files
- `main` - entry points for app distributions
- `module` - modules for app
- `rollup` - bundling sources
- `script` - other scripts

## About script folder

Contains subfolders:
- `common`
- `environment` - dev or production environment setup scripts
- `pipeline`
- `tasks`

Scirpts in `tasks` have to be run from project root directory.