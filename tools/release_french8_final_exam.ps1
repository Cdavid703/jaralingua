[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$RepoRoot = "",
    [string]$SshTarget = "root@177.7.52.161",
    [ValidateRange(1, 65535)]
    [int]$SshPort = 22,
    [string]$IdentityFile = "",
    [string]$PythonCommand = "python",
    [string]$NodeCommand = "node",
    [string]$CommitMessage = "Deploy reversible del examen final de Frances Nivel 8",
    [switch]$SkipTests,
    [switch]$NoCommit
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Write-Step {
    param([string]$Message)
    Write-Host "[french8-release] $Message"
}

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$WorkingDirectory = $RepoRoot
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$FilePath failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-BestEffortRemoteCleanup {
    param(
        [string[]]$SshArguments,
        [string]$RemoteStage
    )

    $cleanupScript = "$RemoteStage/deploy/french8-final-exam-release.sh"
    $cleanupCommand = "if [ -f '$cleanupScript' ]; then bash -- '$cleanupScript' '$RemoteStage' cleanup-only; fi"
    try {
        & ssh @SshArguments $SshTarget $cleanupCommand 2>$null
    }
    catch {
        Write-Warning "Remote staged files could not be cleaned automatically: $($_.Exception.Message)"
    }
}

function Copy-RelativeFile {
    param(
        [string]$RelativePath,
        [string]$DestinationRoot
    )

    $source = Join-Path $RepoRoot ($RelativePath.Replace("/", [IO.Path]::DirectorySeparatorChar))
    $target = Join-Path $DestinationRoot ($RelativePath.Replace("/", [IO.Path]::DirectorySeparatorChar))
    $targetDirectory = Split-Path -Parent $target
    [void](New-Item -ItemType Directory -Path $targetDirectory -Force)
    Copy-Item -LiteralPath $source -Destination $target -Force
}

function Remove-VerifiedLocalStage {
    param([string]$StagePath)

    if ([string]::IsNullOrWhiteSpace($StagePath) -or -not (Test-Path -LiteralPath $StagePath)) {
        return
    }
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    $resolved = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $StagePath).Path)
    $leaf = Split-Path -Leaf $resolved
    if (-not $resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean a stage outside the operating-system temporary directory: $resolved"
    }
    if (-not $leaf.StartsWith("jaralingua-french8-release-", [StringComparison]::Ordinal)) {
        throw "Refusing to clean an unexpected temporary directory: $resolved"
    }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}

function Invoke-ScopedCommit {
    param([string[]]$Paths)

    $statusArguments = @("-C", $RepoRoot, "status", "--porcelain", "--") + $Paths
    $changes = & git @statusArguments
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed with exit code $LASTEXITCODE"
    }
    if ([string]::IsNullOrWhiteSpace(($changes | Out-String))) {
        Write-Step "No scoped changes need a commit."
        return
    }

    $addArguments = @("-C", $RepoRoot, "add", "--") + $Paths
    Invoke-Native -FilePath "git" -Arguments $addArguments

    # --only ensures that unrelated changes already present in the index are not committed.
    $commitArguments = @("-C", $RepoRoot, "commit", "--only", "-m", $CommitMessage, "--") + $Paths
    Invoke-Native -FilePath "git" -Arguments $commitArguments
    Write-Step "Created a local scoped commit. No push was performed."
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

if ($SshTarget -notmatch '^[A-Za-z0-9._-]+@[A-Za-z0-9._:-]+$') {
    throw "SshTarget contains unsupported characters."
}

$PayloadPaths = @(
    "data/french8-final-exam.local.json",
    "frances/Niveau 8/examen-final.html",
    "frances/Niveau 8/index.html",
    "frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png",
    "server/final_exam_runtime.py",
    "server/final_exam_storage.py",
    "server/progress_api.py",
    "server/private_assets/french8-final-exam-audio.mp3",
    "deploy/jaralingua-progress-api-french8-final.conf",
    "deploy/french8-final-exam-release.sh"
)

$CommitPaths = @(
    "frances/Niveau 8/examen-final.html",
    "frances/Niveau 8/index.html",
    "frances/Niveau 8/img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png",
    "server/final_exam_runtime.py",
    "server/final_exam_storage.py",
    "server/progress_api.py",
    "deploy/french8-final-exam-release.sh",
    "deploy/jaralingua-progress-api-french8-final.conf",
    "tools/generate_french8_final_exam_audio.ps1",
    "tools/release_french8_final_exam.ps1",
    "tools/test_final_exam_runtime.py",
    "tools/test_french_final_exam_backend.py",
    "tools/test_french8_final_exam_backend.py",
    "tools/test_french8_final_exam_content.py",
    "tools/test_french8_final_exam_operations.py",
    "tools/test_french8_final_exam_page.cjs",
    "tools/test_french8_final_exam_release_pipeline.py",
    "tools/test_french8_final_exam_storage.py"
)

foreach ($relativePath in $PayloadPaths) {
    $fullPath = Join-Path $RepoRoot ($relativePath.Replace("/", [IO.Path]::DirectorySeparatorChar))
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw "Required release file is missing: $relativePath"
    }
    $item = Get-Item -LiteralPath $fullPath -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Release payload may not contain links or reparse points: $relativePath"
    }
}

if ($WhatIfPreference) {
    Write-Step "WhatIf: would run scoped tests, optionally create a scoped local commit, stage $($PayloadPaths.Count) files, and deploy to $SshTarget."
    return
}

if (-not $SkipTests) {
    Write-Step "Running unit and contract tests (no browser E2E)."
    $testCommands = @(
        @{ File = $PythonCommand; Arguments = @("tools/test_final_exam_runtime.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french_final_exam_backend.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french8_final_exam_storage.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french8_final_exam_backend.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french8_final_exam_content.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french8_final_exam_operations.py") },
        @{ File = $PythonCommand; Arguments = @("tools/test_french8_final_exam_release_pipeline.py") },
        @{ File = $NodeCommand; Arguments = @("tools/test_french8_final_exam_page.cjs") }
    )
    foreach ($command in $testCommands) {
        Invoke-Native -FilePath $command.File -Arguments $command.Arguments
    }
}
else {
    Write-Warning "Tests were skipped explicitly."
}

if (-not $NoCommit) {
    if ($PSCmdlet.ShouldProcess($RepoRoot, "create a local commit limited to French 8 final-exam files")) {
        Invoke-ScopedCommit -Paths $CommitPaths
    }
}
else {
    Write-Step "Local commit disabled with -NoCommit."
}

if (-not $PSCmdlet.ShouldProcess($SshTarget, "publish the French 8 final exam with automatic rollback")) {
    return
}

$releaseId = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ") + "-" + [Guid]::NewGuid().ToString("N").Substring(0, 12)
$stageRoot = Join-Path ([IO.Path]::GetTempPath()) "jaralingua-french8-release-$releaseId"
$remoteStage = "/tmp/jaralingua-french8-release-$releaseId"
$remoteMayExist = $false

$sshArguments = @("-p", $SshPort.ToString(), "-o", "BatchMode=yes")
$scpArguments = @("-P", $SshPort.ToString(), "-o", "BatchMode=yes")
if (-not [string]::IsNullOrWhiteSpace($IdentityFile)) {
    $resolvedIdentity = (Resolve-Path -LiteralPath $IdentityFile).Path
    $sshArguments += @("-i", $resolvedIdentity)
    $scpArguments += @("-i", $resolvedIdentity)
}

try {
    [void](New-Item -ItemType Directory -Path $stageRoot)
    foreach ($relativePath in $PayloadPaths) {
        Copy-RelativeFile -RelativePath $relativePath -DestinationRoot $stageRoot
    }

    # A Windows checkout may use CRLF; the remote Bash payload is normalized before hashing.
    $stagedReleaseScript = Join-Path $stageRoot "deploy/french8-final-exam-release.sh"
    $releaseText = [IO.File]::ReadAllText($stagedReleaseScript).Replace("`r`n", "`n").Replace("`r", "`n")
    [IO.File]::WriteAllText($stagedReleaseScript, $releaseText, (New-Object Text.UTF8Encoding($false)))

    $manifestLines = foreach ($relativePath in $PayloadPaths) {
        $stagedPath = Join-Path $stageRoot ($relativePath.Replace("/", [IO.Path]::DirectorySeparatorChar))
        $hash = (Get-FileHash -LiteralPath $stagedPath -Algorithm SHA256).Hash.ToLowerInvariant()
        "$hash  ./$relativePath"
    }
    $manifestPath = Join-Path $stageRoot "SHA256SUMS"
    [IO.File]::WriteAllText($manifestPath, (($manifestLines -join "`n") + "`n"), [Text.Encoding]::ASCII)
    Write-Step "Prepared an explicit checksummed stage: $stageRoot"

    $remotePrepare = "install -d -o root -g root -m 0700 -- '$remoteStage/deploy'"
    Invoke-Native -FilePath "ssh" -Arguments ($sshArguments + @($SshTarget, $remotePrepare))
    $remoteMayExist = $true

    $localReleaseScript = Join-Path $stageRoot "deploy/french8-final-exam-release.sh"
    Invoke-Native -FilePath "scp" -Arguments ($scpArguments + @($localReleaseScript, "${SshTarget}:$remoteStage/deploy/"))
    Invoke-Native -FilePath "scp" -Arguments ($scpArguments + @("-r", $stageRoot, "${SshTarget}:/tmp/"))

    $remoteScript = "$remoteStage/deploy/french8-final-exam-release.sh"
    $remoteCommand = "bash -- '$remoteScript' '$remoteStage' deploy"
    Invoke-Native -FilePath "ssh" -Arguments ($sshArguments + @($SshTarget, $remoteCommand))
    $remoteMayExist = $false
    Write-Step "Release completed. The remote script retained a timestamped rollback backup."
}
catch {
    if ($remoteMayExist) {
        Invoke-BestEffortRemoteCleanup -SshArguments $sshArguments -RemoteStage $remoteStage
    }
    throw
}
finally {
    Remove-VerifiedLocalStage -StagePath $stageRoot
}
