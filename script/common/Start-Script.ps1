#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Sets up global variables.
	File is to be dot-sourced.
	Stop script should be run in `finally` within caller of this, but this should go before the `try`.
#>

if ($null -eq (Get-Variable -Name "StartScriptGuard" -Scope "Script" -ErrorAction "Ignore")) {
	# Set the error action; Should stop execution on "pwsh cmdlets", but not external commands
	$script:ErrorActionPreferenceOriginal = $ErrorActionPreference
	$ErrorActionPreference = "Stop"
	
	# Root path; Resolve to remove ".."
	[ValidateNotNullOrEmpty()][string]$private:RootDirectory = Join-Path $PSScriptRoot ".." ".." -Resolve

	# Change path to repo root
	Push-Location -Path $RootDirectory

	# Create paths hashtable
	[ValidateNotNull()][hashtable]$script:Paths = @{
		RootDirectory           = $RootDirectory
		StopScript              = Join-Path "script" "common" "Stop-Script.ps1";
		WriteMessage            = Join-Path "script" "common" "Write-Message.ps1";
		NewDirectoryIfNotExists = Join-Path "script" "common" "New-DirectoryIfNotExists.ps1";
		BuildAssets             = Join-Path "script" "tasks" "Build-Assets.ps1";
		BuildDocumentation      = Join-Path "script" "tasks" "Build-Documentation.ps1";
		InstallDependencies     = Join-Path "script" "tasks" "Install-Dependencies.ps1";
		BuildApplication        = Join-Path "script" "tasks" "Build-Application.ps1";
	}

	. $Paths.WriteMessage -Message "Starting script"

	Write-Host Paths -ForegroundColor DarkGreen -NoNewline
	(Format-Table -HideTableHeaders -InputObject $Paths | Out-String).TrimEnd()

	# Set guard last, as this won't be part of `try` block
	New-Variable -Name "StartScriptGuard" -Scope "Script"
}