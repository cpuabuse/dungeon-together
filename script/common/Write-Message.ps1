#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Write formatted message to console.
#>

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Message
)

# Set newline
[string]$private:Indent = "`n";

# Set newline for first run
if ($null -eq (Get-Variable -Name "WriteMessageGuard" -Scope "Global" -ErrorAction "Ignore")) {
	# Guard
	New-Variable -Name "WriteMessageGuard" -Scope "Global"
	$Indent = $null
}

Write-Host "$Indent$Message..." -ForegroundColor DarkBlue