$base = "C:\Users\ilavarasan\AppData\Local\ms-playwright"

# Create junction for chromium-1200 (full chromium)
$srcChromium = Get-ChildItem $base | Where-Object { $_.Name -like "chromium-1[0-9]*" } | Sort-Object Name -Descending | Select-Object -First 1
if ($srcChromium) {
    $dst = Join-Path $base "chromium-1200"
    if (-not (Test-Path $dst)) {
        New-Item -ItemType Junction -Path $dst -Target $srcChromium.FullName -Force
        Write-Host "Created chromium-1200 -> $($srcChromium.Name)"
    } else {
        Write-Host "chromium-1200 already exists"
    }
}

# Create junction for chromium_headless_shell-1200
$srcShell = Get-ChildItem $base | Where-Object { $_.Name -like "chromium_headless_shell-1[0-9]*" -and $_.Name -ne "chromium_headless_shell-1200" } | Sort-Object Name -Descending | Select-Object -First 1
if ($srcShell) {
    $dst2 = Join-Path $base "chromium_headless_shell-1200"
    if (-not (Test-Path $dst2)) {
        New-Item -ItemType Junction -Path $dst2 -Target $srcShell.FullName -Force
        Write-Host "Created chromium_headless_shell-1200 -> $($srcShell.Name)"
    } else {
        Write-Host "chromium_headless_shell-1200 already exists"
    }
}

Write-Host "Done. Installed:"
Get-ChildItem $base | Select-Object Name
