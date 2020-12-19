#!/usr/bin/env pwsh

# Start-Pipeline
. $(Join-Path -Path $PSScriptRoot -ChildPath "common" "Start-Pipeline.ps1")

# Install-Dependencies
& $Paths.InstallDependencies

# Test
npm run build:test:standalone:node; if (-not $?) { throw }
npm run run:test:standalone:node; if (-not $?) { throw }

# Stop-Pipeline
$Paths.StopPipeline