#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds assets.
	Should rebuild assets for each enviornment, as the assets may vary.
#>

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Environment,

	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Build
)

. $Paths.WriteMessage -Message "Building assets"

[ValidateNotNullOrEmpty()][string]$private:BuildPublicPath = Join-Path "build" $Environment "$Build-public"

. $Paths.NewDirectoryIfNotExists -Path $BuildPublicPath

. $Paths.WriteMessage -Message "Building CSS"

# CSS
. $Paths.NewDirectoryIfNotExists -Path $(Join-Path $BuildPublicPath css/hljs)
npx ncp node_modules/highlight.js/styles/a11y-dark.css $(Join-Path $BuildPublicPath css/hljs/a11y-dark.css); if (-not $?) { throw }
npx ncp node_modules/highlight.js/styles/a11y-light.css $(Join-Path $BuildPublicPath /css/hljs/a11y-light.css); if (-not $?) { throw }

# Assets
. $Paths.WriteMessage -Message "Building other assets"
deno run --allow-read --allow-write $(Join-Path $PSScriptRoot "common" build-assets.deno.ts) --rootDir $(Get-Location) --environment $Environment --build $Build; if (-not $?) { throw }
