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
# Variable is named as `name` on purpose, as if directory is not a direct child, would need special logic for replacement for forward slash in `index.html`
[ValidateNotNullOrEmpty()][string]$private:DocsTargetSubdirectoryName = "docs"
[ValidateNotNullOrEmpty()][string]$private:DocsTargetSubdirectoryPath = Join-Path $BuildDocumentationPath $DocsTargetSubdirectoryName
[ValidateNotNullOrEmpty()][string]$private:CoverpagePath = Join-Path $DocsTargetSubdirectoryPath "_coverpage.md"

# Create folders
. $Paths.NewDirectoryIfNotExists -Path $BuildDocumentationPath # Present for clarity
# Subdirectory is required, otherwise first copy of folder into an empty folder would copy contents instead;
. $Paths.NewDirectoryIfNotExists -Path $DocsTargetSubdirectoryPath

# Build, overwrite if exists
Get-ChildItem -Path $DocsSourcePath | ForEach-Object {
	$DestinationParam = @{
		Destination = $_.Name -ne "index.html" ? $DocsTargetSubdirectoryPath : $BuildDocumentationPath
	}
	Copy-Item -Path $_.FullName @DestinationParam -Recurse -Force
}

# Replace index
. $Paths.WriteMessage -Message "Replacing index" -Deep
[ValidateNotNullOrEmpty()][string]$private:IndexContent = Get-Content -Path $IndexPath -Raw
$IndexContent = $IndexContent -replace "const basePath = `".`";", "const basePath = `"$DocsTargetSubdirectoryName`";"
Set-Content -Path $IndexPath -Value $IndexContent

. $Paths.WriteMessage -Message "Replacing coverage" -Deep
[ValidateNotNullOrEmpty()][string]$private:CoverpageContent = Get-Content -Path $CoverpagePath -Raw
$CoverpageContent = $CoverpageContent -replace "../build/dev/standalone/src/html/standalone.html", "standalone/src/html/standalone.html"
Set-Content -Path $CoverpagePath -Value $CoverpageContent

# Copy app, overwrite if exists
. $Paths.WriteMessage -Message "Copying app" -Deep
Copy-Item -Path $BuildApplicationPath -Destination $BuildDocumentationPath -Recurse -Force