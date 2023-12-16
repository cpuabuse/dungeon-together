#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Runs tests in shell.
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
. $Paths.WriteMessage -Message "Invoking test"
npx mocha $(Join-Path "build" $Build $Environment "$Environment.js"); if (-not $?) { throw }