#!/usr/bin/env pwsh
#requires -PSEdition Core

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string[]]
	$Environment,

	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string[]]
	$Build
)

# Resolving path to remove relative navigation
[ValidateNotNullOrEmpty()][string[]]$private:RootDir = Join-Path $PSScriptRoot ../ ../ -Resolve
[ValidateNotNullOrEmpty()][string[]]$private:BuildPublicPath = Join-Path $RootDir build/$Environment/$Build-public

Write-Output $BuildPublicPath;
npx mkdirp $BuildPublicPath; if (-not $?) { throw }

# CSS
npx mkdirp $BuildPublicPath/css/hljs; if (-not $?) { throw }
npx ncp $(Join-Path $RootDir node_modules/highlight.js/styles/a11y-dark.css) $(Join-Path $BuildPublicPath css/hljs/a11y-dark.css); if (-not $?) { throw }
npx ncp $(Join-Path $RootDir node_modules/highlight.js/styles/a11y-light.css) $(Join-Path $BuildPublicPath /css/hljs/a11y-light.css); if (-not $?) { throw }

# Assets
deno run --allow-read --allow-write $(Join-Path $PSScriptRoot build-assets.deno.ts) --rootDir $RootDir --environment $Environment --build $Build; if (-not $?) { throw }
