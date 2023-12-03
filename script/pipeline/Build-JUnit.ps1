#!/usr/bin/env pwsh

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

# Install-Dependencies
& $Paths.InstallDependencies

# Build
npm run junit; if (-not $?) { throw }

# Stop Pipeline
& $Paths.StopPipeline