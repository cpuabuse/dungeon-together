#!/usr/bin/env pwsh

# Start Pipeline
. $(Join-Path $PSScriptRoot ".." "common" "Start-Script.ps1")

# Install-Dependencies
. $Paths.InstallDependencies

# Test
npm run build:test:standalone:node; if (-not $?) { throw }
npm run run:test:standalone:node; if (-not $?) { throw }

# Stop Pipeline
. $Paths.StopPipeline