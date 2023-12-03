#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds all environments, for development.
#>

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

# Log
. $Paths.WriteMessage -Message "Building site"

# Install deps
. $Paths.InstallDependencies

# Build Assets
. $Paths.BuildAssets -Environment dev -Build standalone

# Build app
. $Paths.BuildApplication

# Build docs
. $Paths.BuildDocumentation -Environment dev -Build standalone

# Stop Pipeline
. $Paths.StopScript