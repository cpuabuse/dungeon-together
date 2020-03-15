<#
	File: script\environment\Remove-TypeScriptArtifacts.ps1
	Author: cpuabuse.com
	Description: Recursively removes all JS files, for example if tsc was accidentally ran with default options
#>

Remove-Item -Path "src" -Recurse -Include "*.d.ts"
Remove-Item -Path "src" -Recurse -Include "*.js"
Remove-Item -Path "src" -Recurse -Include "*.js.map"
Remove-Item -Path "test" -Recurse -Include "*.d.ts"
Remove-Item -Path "test" -Recurse -Include "*.js"
Remove-Item -Path "test" -Recurse -Include "*.js.map"