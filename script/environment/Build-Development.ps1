#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds all environments, for development.
#>

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

try {
	# Log
	. $Paths.WriteMessage -Message "Initializing environment"

	# Build Assets
	. $Paths.BuildAssets -Environment dev -Build standalone

	# Build App
	. $Paths.BuildApplication

	# Build docs
	. $Paths.BuildDocumentation -Environment dev -Build standalone
}
finally {
	# Stop Pipeline
	. $Paths.StopScript
}