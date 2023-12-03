#!/usr/bin/env pwsh

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

try {
	# Install-Dependencies
	. $Paths.InstallDependencies

	# Test
	npm run build:test:standalone:node; if (-not $?) { throw }
	npm run run:test:standalone:node; if (-not $?) { throw }
}
finally {
	# Stop Pipeline
	. $Paths.StopPipeline
}