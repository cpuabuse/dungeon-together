#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds all environments, for development.
#>

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

try {
	# Log
	. $Paths.WriteMessage -Message "Building site"

	# Install deps
	. $Paths.InstallDependencies

	# Build Assets
	. $Paths.BuildAssets -Environment dev -Build standalone

	# Build app
	. $Paths.BuildApplication

	# Build Reference
	. $Paths.BuildReference -Environment dev -Build standalone

	# Build docs
	. $Paths.BuildDocumentation -Environment dev -Build standalone
}
finally {
	# Stop Pipeline
	. $Paths.StopScript
}