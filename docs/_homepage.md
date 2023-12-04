## Dungeon Together

[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/cpuabuse/dungeon-together/.github%2Fworkflows%2Fpages.yml?logo=github)](https://github.com/cpuabuse/dungeon-together/actions/workflows/pages.yml)

Dungeon Together is an open source game under development.

### How it works

```mermaid

flowchart LR
	user[👤User]

	subgraph client_instance[💻Client Container]
		direction TB
		subgraph client_app[Client App]
			direction TB
			client_universe["Client Universe"]
			pixi_webgl[
				<span><a href='https://pixijs.com'><img src='https://files.pixijs.download/branding/pixijs-logo-transparent-dark.svg' alt='Pixi' /></a>
				<a href='https://www.khronos.org/webgl/'><img src='https://upload.wikimedia.org/wikipedia/commons/2/25/WebGL_Logo.svg' alt='WebGL' /></a></span>
			]
			class pixi_webgl image-node-marker
			vue[
				<span><a href='https://vuejs.org'><img src='https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg' alt='Vue.js' />Vue.js</a></span>
			]
			class vue image-node-marker

			client_universe-->pixi_webgl-->DOM
			client_universe<-->vue<-->DOM
		end
		Client <--> client_app --> Assets
	end

	subgraph server_instance[🖥️Server Container]
		direction TB
		Server <--> server_app[Server App]
	end

	client_instance2[📱More Clients]

	user2["👥More Users"]

	user <--> client_instance <-- 🌐 --> server_instance <-- 🌐 --> client_instance2 <--> user2
```

## How it's built

Dungeon Together is an [SPA](https://en.wikipedia.org/wiki/Single-page_application) application, loaded as a single JS module into a simple HTML skeleton.

```mermaid
flowchart LR
	subgraph Environment
		node[
			<span><a href='https://nodejs.org/en'><img src='https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg' alt='Node.js' /></a></span>
		]
		class node image-node-marker

		deno[
			<span><a href='https://deno.com'><img src='https://upload.wikimedia.org/wikipedia/commons/8/84/Deno.svg' alt='Deno' />Deno</a></span>
		]
		class deno image-node-marker

		pwsh[
			<span><a href='https://github.com/PowerShell/PowerShell'><img src='https://raw.githubusercontent.com/PowerShell/PowerShell/master/assets/ps_black_64.svg' alt='PowerShell Core' />PowerShell Core</a></span>
		]
		class pwsh image-node-marker
	end

	subgraph app_build[App build]
		vite[
			<span><a href='https://vitejs.dev'><img src='https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg' alt='Vite' />Vite</a></span>
		]
		class vite image-node-marker

		rollup[
			<span><a href='https://rollupjs.org'><img src='https://raw.githubusercontent.com/rollup/rollup/master/docs/public/rollup-logo.svg' alt='Rollup' />Rollup</a></span>
		]
		class rollup image-node-marker

		direction TB
		subgraph App
			direction TB
			index[index.html]
			index -- includes --> index.js
			index -- includes --> Assets
		end

		vite --> rollup -- ts/vue/scss/glsl --> App
	end

	docsify[
		<span><a href='https://docsify.js.org'><img src='https://raw.githubusercontent.com/docsifyjs/docsify/develop/docs/_media/icon.svg' alt='docsify' />docsify</a></span>
	]
	class docsify image-node-marker
	
	this_page[
		Page you are
		currently seeing
	]
	actions[
		<span><a href='https://docs.github.com/en/actions'><img src='https://avatars.githubusercontent.com/u/44036562' alt='GitHub Actions' />GitHub Actions</a></span>
	]
	class actions image-node-marker

	Environment --> docsify --> actions
	Environment --> app_build --> actions
	actions --> this_page
```

# How to play

Instructions appear automatically when game loads.
Scroll to the top of the page for link to play.

<style>
	/* Style goes into the end to not interfere with page CSS */
	.image-node-marker span:has(a>img) {
		min-width: 4em!important;
		display: block!important;
	}
	.image-node-marker span>a>img {
		margin: auto!important;
		max-width: 4em!important;
	}
</style>
