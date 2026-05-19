[CmdletBinding()]
param(
    [string]$RepoRoot = "",
    [switch]$CreateLocalConfig
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param([string[]]$Arguments)

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$hookPath = Join-Path $RepoRoot ".githooks"
$exampleConfig = Join-Path $RepoRoot "deploy.example.env"
$localConfig = Join-Path $RepoRoot "deploy.local.env"

if (-not (Test-Path -LiteralPath (Join-Path $hookPath "post-commit"))) {
    throw "Missing .githooks/post-commit. Run this script from the repository checkout."
}

Invoke-Git -Arguments @("-C", $RepoRoot, "config", "core.hooksPath", ".githooks")
Write-Host "[auto-sync] Git hook path configured: .githooks"

if ($CreateLocalConfig -or -not (Test-Path -LiteralPath $localConfig)) {
    Copy-Item -LiteralPath $exampleConfig -Destination $localConfig -Force
    Write-Host "[auto-sync] Created deploy.local.env from deploy.example.env"
}

Write-Host "[auto-sync] Ready. Future commits on the configured branch will push and deploy automatically."
