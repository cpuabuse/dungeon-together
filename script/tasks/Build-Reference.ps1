#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Builds API reference.
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
. $Paths.WriteMessage -Message "Building reference"

# Paths
[ValidateNotNullOrEmpty()][string]$private:BuildPath = Join-Path "build" $Environment
[ValidateNotNullOrEmpty()][string]$private:ConfigAndReflectionPathToRoot = Join-Path .. $([IO.Path]::GetRelativePath($BuildPath, ".")) # Should be OK as long as config and reflection path are both contained in same directory
[ValidateNotNullOrEmpty()][string]$private:BuildReferencePath = Join-Path $BuildPath "$Build-ref"
[ValidateNotNullOrEmpty()][string]$private:BuildReflectionPath = Join-Path $BuildPath "$Build-ref-reflect"
[ValidateNotNullOrEmpty()][string]$private:BuildConfigPath = Join-Path $BuildPath "$Build-ref-config"
[ValidateNotNullOrEmpty()][string]$private:MergeConfigPath = Join-Path $BuildConfigPath "merge.typedoc.json"

# Configs
[ValidateNotNull()][hashtable]$private:BaseConfig = @{
	"extends"       = Join-Path $ConfigAndReflectionPathToRoot "typedoc.json"
	"hideGenerator" = $true
	"showConfig"    = $true
	"logLevel"      = "Verbose"
};
[ValidateNotNull()][hashtable[]]$private:ReflectionConfigs = @(
	@{
		"name"        = "Standalone Application"
		"entryPoints" = @(Join-Path $ConfigAndReflectionPathToRoot "src/app/application/standalone.ts")
	},
	@{
		"name"        = "YAML Compiler"
		"entryPoints" = @(Join-Path $ConfigAndReflectionPathToRoot "src/app/yaml")
	},
	@{
		"name"               = "Core"
		"entryPoints"        = @(Join-Path $ConfigAndReflectionPathToRoot "src/app/core")
		"entryPointStrategy" = "expand"
	},
	@{
		"name"               = "Server"
		"entryPoints"        = @(Join-Path $ConfigAndReflectionPathToRoot "src/app/server")
		"entryPointStrategy" = "expand"
	},
	@{
		"name"               = "Client"
		"entryPoints"        = @(Join-Path $ConfigAndReflectionPathToRoot "src/app/client")
		"entryPointStrategy" = "expand"
	}
)
[ValidateNotNull()][hashtable]$private:MergeConfig = @{
	"entryPointStrategy" = "merge"
	"out"                = Join-Path $ConfigAndReflectionPathToRoot $BuildReferencePath
	"entryPoints"        = @()
	# Order important for links
	"navigationLinks"    = [ordered]@{
		"Home"      = "__SCRIPT_HOME_HREF__"
		"GitHub"    = "https://github.com/cpuabuse/dungeon-together"
		"Reference" = "__SCRIPT_REFERENCE_HREF__"
		"Play"      = "__SCRIPT_PLAY_HREF__"
	}
	"name"               = "Dungeon Together Reference"
}

# Create folders
. $Paths.NewDirectoryIfNotExists -Path $BuildReferencePath
. $Paths.NewDirectoryIfNotExists -Path $BuildReflectionPath
. $Paths.NewDirectoryIfNotExists -Path $BuildConfigPath

$ReflectionConfigs | Foreach-Object -Process {
	[ValidateNotNullOrEmpty()][string]$private:CurrentConfigPath = Join-Path $BuildConfigPath "$i.typedoc.json"
	[ValidateNotNullOrEmpty()][string]$private:CurrentReflectionPath = Join-Path $BuildReflectionPath "$i.reflect.json"

	# Log
	. $Paths.WriteMessage -Message "Building `"$($_.Name)`" config at `"$CurrentReflectionPath`"" -Deep

	# Save reflection params as json
	($BaseConfig + $_ + @{
		json       = Join-Path $ConfigAndReflectionPathToRoot $CurrentReflectionPath
		validation = @{
			notExported = $false # Ignore for partial reflections
		}
		plugin     = @(
			"typedoc-plugin-merge-modules"
		)
	}) | ConvertTo-Json | Out-File -FilePath $CurrentConfigPath

	# Log
	. $Paths.WriteMessage -Message "Building `"$($_.Name)`" reflection at `"$CurrentReflectionPath`"" -Deep

	# Build
	npx typedoc "--options" $CurrentConfigPath; if (-not $?) { throw }

	# Add to merge config
	$MergeConfig.entryPoints += Join-Path $ConfigAndReflectionPathToRoot $CurrentReflectionPath

	# Increment
	$i++;
} -Begin { [ValidateRange("NonNegative")][ValidateNotNull()][int]$private:i = 0 }


# Log
. $Paths.WriteMessage -Message "Building merge config" -Deep

# Build config for merge
($BaseConfig + $MergeConfig) | ConvertTo-Json | Out-File -FilePath $MergeConfigPath

# Log
. $Paths.WriteMessage -Message "Merging reference" -Deep

throw;

# Build
npx typedoc "--options" $MergeConfigPath; if (-not $?) { throw }

# Log
. $Paths.WriteMessage -Message "Replacing links" -Deep

# Cleanup
Get-ChildItem -Path $BuildReferencePath -Filter "*.html" -Recurse | Foreach-Object { 
	[ValidateNotNullOrEmpty()][string]$private:Content = Get-Content $_ -Raw
	$Content -match '<a href="(?<LinkToRoot>.*?)" class="title">' | Out-Null # Returns if match found; Silencing
	[ValidateNotNullOrEmpty()][string]$private:LinkToRoot = $Matches.LinkToRoot
	if ($LinkToRoot -notlike "*.html") { throw "Link to root is unexpected" } # Error, since there will be accounting for extra level when merging relative paths
	$Content = $Content -replace "__SCRIPT_HOME_HREF__", $([IO.Path]::GetRelativePath(".", $(Join-Path $LinkToRoot ".." "..")) -replace "\\", "/")
	$Content = $Content -replace "__SCRIPT_REFERENCE_HREF__", $LinkToRoot
	$Content = $Content -replace "__SCRIPT_PLAY_HREF__", $([IO.Path]::GetRelativePath(".", $(Join-Path $LinkToRoot ".." ".." "standalone/src/html/standalone.html")) -replace "\\", "/")
	Set-Content $_ $Content
}