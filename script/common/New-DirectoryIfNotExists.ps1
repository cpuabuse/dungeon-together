<#
	Creates a directory if it doesn't exist.
#>
param (
	# Path to create
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Path
)

if (-not $(Test-Path -Path $Path)) {
	[void](New-Item -ItemType Directory -Path $Path)
}