#!/usr/bin/env pwsh

# Start-Pipeline
. $(Join-Path -Path $PSScriptRoot -ChildPath "common" "Start-Pipeline.ps1")

# Install-Dependencies
& $Paths.InstallDependencies

# Build
npm run junit; if (-not $?) { throw }

# Stop-Pipeline
$Paths.StopPipeline