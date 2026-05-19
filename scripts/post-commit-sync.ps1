[CmdletBinding()]
param(
    [string]$RepoRoot = "",
    [string]$ConfigPath,
    [switch]$SkipPush,
    [switch]$SkipVps
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[auto-sync] $Message"
}

function Get-Setting {
    param(
        [string]$Name,
        [string]$Default = ""
    )

    $value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }

    return $value
}

function Import-EnvFile {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    foreach ($rawLine in Get-Content -LiteralPath $Path) {
        $line = $rawLine.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
            continue
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            continue
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not [string]::IsNullOrWhiteSpace($name)) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

function Invoke-Checked {
    param(
        [string]$File,
        [string[]]$Arguments,
        [string]$WorkingDirectory = $RepoRoot
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $File @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$File failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Quote-Sh {
    param([string]$Value)
    return "'" + $Value.Replace("'", "'\''") + "'"
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $ConfigPath = Join-Path $RepoRoot "deploy.local.env"
}

Import-EnvFile -Path $ConfigPath

if ((Get-Setting -Name "AUTO_DEPLOY_DISABLE" -Default "0") -eq "1") {
    Write-Step "Disabled by AUTO_DEPLOY_DISABLE=1."
    exit 0
}

$branch = (& git -C $RepoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    throw "Could not detect current Git branch."
}

$deployBranch = Get-Setting -Name "AUTO_DEPLOY_BRANCH" -Default "main"
if ($branch -ne $deployBranch) {
    Write-Step "Current branch is '$branch'; configured branch is '$deployBranch'. Skipping."
    exit 0
}

$remote = Get-Setting -Name "AUTO_DEPLOY_REMOTE" -Default "origin"

if (-not $SkipPush) {
    Write-Step "Pushing $branch to $remote."
    Invoke-Checked -File "git" -Arguments @("-C", $RepoRoot, "push", $remote, "HEAD:$branch")
}

if ($SkipVps) {
    Write-Step "Skipping VPS deploy by request."
    exit 0
}

$vpsTarget = Get-Setting -Name "VPS_SSH_TARGET"
$vpsAppDir = Get-Setting -Name "VPS_APP_DIR"

if ([string]::IsNullOrWhiteSpace($vpsTarget) -or [string]::IsNullOrWhiteSpace($vpsAppDir)) {
    Write-Step "VPS is not configured. Add VPS_SSH_TARGET and VPS_APP_DIR to deploy.local.env."
    exit 0
}

$vpsGitRemote = Get-Setting -Name "VPS_GIT_REMOTE" -Default "origin"
$postDeployCommand = Get-Setting -Name "VPS_POST_DEPLOY_COMMAND"

$remoteCommandParts = @(
    "set -e",
    "cd $(Quote-Sh -Value $vpsAppDir)",
    "git fetch $(Quote-Sh -Value $vpsGitRemote) $(Quote-Sh -Value $branch)",
    "git reset --hard $(Quote-Sh -Value "$vpsGitRemote/$branch")"
)

if (-not [string]::IsNullOrWhiteSpace($postDeployCommand)) {
    $remoteCommandParts += $postDeployCommand
}

$sshArgs = @()
$sshKey = Get-Setting -Name "VPS_SSH_KEY"
$sshPort = Get-Setting -Name "VPS_SSH_PORT"

if (-not [string]::IsNullOrWhiteSpace($sshKey)) {
    $sshArgs += @("-i", $sshKey)
}

if (-not [string]::IsNullOrWhiteSpace($sshPort)) {
    $sshArgs += @("-p", $sshPort)
}

$sshArgs += @($vpsTarget, ($remoteCommandParts -join "; "))

Write-Step "Deploying $branch on ${vpsTarget}:$vpsAppDir."
Invoke-Checked -File "ssh" -Arguments $sshArgs
Write-Step "GitHub push and VPS deploy completed."
