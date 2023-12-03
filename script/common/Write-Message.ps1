#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Write formatted message to console.
#>

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Message,

	[switch]
	$Deep
)

# Set newline
[string]$private:Indent = "`n"

# Set newline
[string]$private:Trail = "..."

if ($Deep) {
	$Indent = "🔹"
	$Trail = $null
}
# Set newline for first run
elseif ($null -eq (Get-Variable -Name "WriteMessageGuard" -Scope "Script" -ErrorAction "Ignore")) {
	# Guard
	New-Variable -Name "WriteMessageGuard" -Scope "Script"
	$Indent = $null
}

Write-Host "$Indent$Message$Trail" -ForegroundColor DarkBlue