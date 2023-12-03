#!/usr/bin/env pwsh
# Deploys Codacy coverage.

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

try {
	# Install-Dependencies
	. $Paths.InstallDependencies

	# Run coverage and get lcov
	npm run codacy; if (-not $?) { throw }
}
finally {
	# Stop Pipeline
	. $Paths.StopPipeline
}