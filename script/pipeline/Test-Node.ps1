#!/usr/bin/env pwsh

# Start-Pipeline
. $(Join-Path -Path $PSScriptRoot -ChildPath "common" "Start-Pipeline.ps1")

# Install-Dependencies
& $Paths.InstallDependencies

# Test
npm test; if (-not $?) { throw }
npm run ts-test; if (-not $?) { throw }

# Stop-Pipeline
$Paths.StopPipeline