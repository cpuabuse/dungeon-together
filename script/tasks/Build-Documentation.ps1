#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds documentation.
	Requires app to be built.
#>

Param(
	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Environment,

	[Parameter(Mandatory = $true)]
	[ValidateNotNullOrEmpty()]
	[string]
	$Build
)

# Log
. $Paths.WriteMessage -Message "Building docs"

# Const
[ValidateNotNullOrEmpty()][string]$private:BuildDocumentationPath = Join-Path "build" $Environment "$Build-docs"
[ValidateNotNullOrEmpty()][string]$private:IndexPath = Join-Path $BuildDocumentationPath "index.html"
[ValidateNotNullOrEmpty()][string]$private:BuildApplicationPath = Join-Path "build" $Environment $Build
[ValidateNotNullOrEmpty()][string]$private:DocsSourcePath = "docs"
[ValidateNotNullOrEmpty()][string]$private:DocsTargetSubdirectory = "docs"
[ValidateNotNullOrEmpty()][string]$private:CoverpagePath = Join-Path $BuildDocumentationPath  $DocsTargetSubdirectory "_coverpage.md"

# Build directory
. $Paths.NewDirectoryIfNotExists -Path $BuildDocumentationPath

# Build, overwrite if exists
Get-ChildItem -Path $DocsSourcePath | ForEach-Object {
	$DestinationParam = @{
		Destination = $_.Name -ne "index.html" ? $(
			Join-Path $BuildDocumentationPath  $DocsTargetSubdirectory
		) : $BuildDocumentationPath
	}
	Copy-Item -Path $_.FullName @DestinationParam -Recurse -Force
}

# Replace index
[ValidateNotNullOrEmpty()][string]$private:IndexContent = Get-Content -Path $IndexPath -Raw
$IndexContent = $IndexContent -replace "const basePath = `"./`";", "const basePath = `"docs`";"
Set-Content -Path $IndexPath -Value $IndexContent

# Replace coverpage
[ValidateNotNullOrEmpty()][string]$private:CoverpageContent = Get-Content -Path $CoverpagePath -Raw
$CoverpageContent = $CoverpageContent -replace "../build/dev/standalone/src/html/standalone.html", "standalone/src/html/standalone.html"
Set-Content -Path $CoverpagePath -Value $CoverpageContent

# Copy app, overwrite if exists
Copy-Item -Path $BuildApplicationPath -Destination $BuildDocumentationPath -Recurse -Force