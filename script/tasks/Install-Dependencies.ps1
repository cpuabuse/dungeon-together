#!/usr/bin/env pwsh
#requires -PSEdition Core
<#
	Installs dependencies.
#>

# Log
. $Paths.WriteMessage -Message "Installing dependencies"

# Install
npm install; if (-not $?) { throw }