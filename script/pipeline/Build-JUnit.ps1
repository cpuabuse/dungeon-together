#!/usr/bin/env pwsh

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

try {
	# Install-Dependencies
	. $Paths.InstallDependencies

	# Build
	npm run junit; if (-not $?) { throw }
}
finally {
	# Stop Pipeline
	. $Paths.StopPipeline
}