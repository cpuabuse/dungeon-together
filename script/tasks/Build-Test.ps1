#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds tests.
#>

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Environment,

	[Parameter()]
	[ValidateNotNullOrEmpty()]
	[string]
	$Build = "test"
)

# Log
. $Paths.WriteMessage -Message "Building test"
npx vite build --config $(Join-Path "vite.config" "$Build.$Environment.vite.config.ts"); if (-not $?) { throw }