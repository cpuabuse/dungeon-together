#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds an app.
	Requires assets to be built.
#>

# Log
& $Paths.WriteMessage -Message "Building app"

npx vite build; if (-not $?) { throw }