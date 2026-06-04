[CmdletBinding()]
param(
    [string]$RepoRoot = "",
    [string]$ConfigPath,
    [switch]$SkipPush,
    [switch]$SkipVps,
    [switch]$NoRebase
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

function Invoke-Captured {
    param(
        [string]$File,
        [string[]]$Arguments,
        [string]$WorkingDirectory = $RepoRoot
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        $output = & $File @Arguments 2>&1
        $code = $LASTEXITCODE
        return [pscustomobject]@{
            Code = $code
            Text = ($output | Out-String).Trim()
        }
    }
    finally {
        Pop-Location
    }
}

function Assert-CleanWorktree {
    $state = Invoke-Captured -File "git" -Arguments @("-C", $RepoRoot, "status", "--porcelain")
    if ($state.Code -ne 0) {
        throw "Could not inspect Git status.`n$($state.Text)"
    }
    if (-not [string]::IsNullOrWhiteSpace($state.Text)) {
        throw "Working tree has uncommitted changes. Commit/stash them before auto-sync can rebase or deploy."
    }
}

function Get-GitText {
    param([string[]]$Arguments)

    $result = Invoke-Captured -File "git" -Arguments $Arguments
    if ($result.Code -ne 0) {
        throw "git $($Arguments -join ' ') failed.`n$($result.Text)"
    }
    return $result.Text
}

function Quote-Sh {
    param([string]$Value)
    return "'" + $Value.Replace("'", "'\''") + "'"
}

function Resolve-RepoPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }
    return (Join-Path $RepoRoot $Path)
}

function Protect-PrivateKey {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path -LiteralPath $Path)) {
        return
    }
    if (-not $IsWindows -and $PSVersionTable.PSVersion.Major -ge 6) {
        return
    }
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $acl = Get-Acl -LiteralPath $Path
    $acl.SetAccessRuleProtection($true, $false)
    foreach ($rule in @($acl.Access)) {
        [void]$acl.RemoveAccessRule($rule)
    }
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $identity,
        [System.Security.AccessControl.FileSystemRights]::Read,
        [System.Security.AccessControl.AccessControlType]::Allow
    )
    $acl.AddAccessRule($accessRule)
    Set-Acl -LiteralPath $Path -AclObject $acl
}

function Get-SshReadyPrivateKey {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    $resolvedPath = Resolve-RepoPath -Path $Path
    if (-not (Test-Path -LiteralPath $resolvedPath)) {
        return $resolvedPath
    }

    if ($IsWindows -or $PSVersionTable.PSVersion.Major -lt 6) {
        $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($resolvedPath.ToLowerInvariant()))
        $hash = -join ($hashBytes[0..7] | ForEach-Object { $_.ToString("x2") })
        $tempKeyPath = Join-Path ([System.IO.Path]::GetTempPath()) "jaralingua-vps-key-$hash"
        Copy-Item -LiteralPath $resolvedPath -Destination $tempKeyPath -Force
        Protect-PrivateKey -Path $tempKeyPath
        return $tempKeyPath
    }

    Protect-PrivateKey -Path $resolvedPath
    return $resolvedPath
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $ConfigPath = Join-Path $RepoRoot "deploy.local.env"
}

Import-EnvFile -Path $ConfigPath

$repoHashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($RepoRoot.ToLowerInvariant()))
$repoHash = -join ($repoHashBytes[0..7] | ForEach-Object { $_.ToString("x2") })
$lockPath = Join-Path ([System.IO.Path]::GetTempPath()) "jaralingua-auto-sync-$repoHash.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $lockStream.SetLength(0)
    $lockBytes = [System.Text.Encoding]::UTF8.GetBytes("pid=$PID started=$(Get-Date -Format o)")
    $lockStream.Write($lockBytes, 0, $lockBytes.Length)
    $lockStream.Flush()
}
catch {
    Write-Step "Another auto-sync is already running. Skipping this run."
    exit 0
}

try {

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
        Assert-CleanWorktree
        Write-Step "Fetching $remote/$branch."
        Invoke-Checked -File "git" -Arguments @("-C", $RepoRoot, "fetch", $remote, $branch)

        $head = Get-GitText -Arguments @("-C", $RepoRoot, "rev-parse", "HEAD")
        $upstream = Get-GitText -Arguments @("-C", $RepoRoot, "rev-parse", "FETCH_HEAD")
        $base = Get-GitText -Arguments @("-C", $RepoRoot, "merge-base", "HEAD", "FETCH_HEAD")

        if ($head -eq $upstream) {
            Write-Step "GitHub is already up to date."
        }
        elseif ($base -eq $head) {
            if ($NoRebase) {
                throw "GitHub is ahead of local main. Pull/rebase before committing, or run without -NoRebase."
            }
            Write-Step "GitHub has newer commits. Rebasing local $branch before push."
            try {
                Invoke-Checked -File "git" -Arguments @(
                    "-C", $RepoRoot,
                    "-c", "core.hooksPath=",
                    "-c", "core.editor=true",
                    "rebase", "FETCH_HEAD"
                )
            }
            catch {
                Write-Step "Automatic rebase failed. Aborting rebase to keep the working tree usable."
                & git -C $RepoRoot rebase --abort 2>$null
                throw
            }
        }
        elseif ($base -ne $upstream) {
            throw "Local and GitHub histories diverged. Resolve manually before auto-sync can push."
        }

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
        "test -d .git",
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
        $sshKey = Get-SshReadyPrivateKey -Path $sshKey
        $sshArgs += @("-i", $sshKey)
    }

    if (-not [string]::IsNullOrWhiteSpace($sshPort)) {
        $sshArgs += @("-p", $sshPort)
    }

    $sshArgs += @($vpsTarget, ($remoteCommandParts -join "; "))

    Write-Step "Deploying $branch on ${vpsTarget}:$vpsAppDir."
    Invoke-Checked -File "ssh" -Arguments $sshArgs
    Write-Step "GitHub push and VPS deploy completed."
}
finally {
    if ($lockStream) {
        $lockStream.Dispose()
    }
    if (Test-Path -LiteralPath $lockPath) {
        Remove-Item -LiteralPath $lockPath -Force
    }
}
