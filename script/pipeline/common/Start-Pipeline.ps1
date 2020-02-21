#!/usr/bin/env pwsh
# File is to be dot-sourced

if ($null -eq (Get-Variable -Name "StartPipelineGuard" -Scope "Script" -ErrorAction "Ignore")) {
	# Guard
	New-Variable -Name "StartPipelineGuard" -Scope "Script"

	# Set the error action
	$script:ErrorActionPreferenceOriginal = $ErrorActionPreference
	$ErrorActionPreference = "Stop"

	# Change path to repo root
	Push-Location -Path $(Join-Path -Path $PSScriptRoot -ChildPath ".." ".." "..")

	# Create paths hashtable
	[ValidateNotNull()][hashtable]$script:Paths += @{
		InstallDependencies = Join-Path -Path "script" -ChildPath "pipeline" "common" "Install-Dependencies.ps1";
		StopPipeline        = Join-Path -Path "script" -ChildPath "pipeline" "common" "Stop-Pipeline.ps1";
	}
}