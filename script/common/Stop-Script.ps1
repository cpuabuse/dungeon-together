#!/usr/bin/env pwsh
# File is to be dot-sourced


if ($null -ne (Get-Variable -Name "StartPipelineGuard" -Scope "Script" -ErrorAction "Ignore")) {
	. $Paths.WriteMessage -Message "Stopping script"
	
	# Revert error action
	$ErrorActionPreference = $script:ErrorActionPreferenceOriginal
	Remove-Variable -Name "ErrorActionPreferenceOriginal" -Scope "Script"

	# Remove Paths var
	Remove-Variable -Name "Paths" -Scope "Script"
	
	# Return location
	Pop-Location

	# Guard
	Remove-Variable -Name "StartPipelineGuard" -Scope "Script"
}