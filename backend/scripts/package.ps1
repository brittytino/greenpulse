$ErrorActionPreference = "Stop"

$root = $PSScriptRoot + "\.."
$staging = "$root\lambda-package"
$dist = "$root\dist"
$zipOutput = "$root\GreenPulseAPI.zip"

Write-Host "Creating deployment package for GreenPulseAPI..."

if (Test-Path $staging) {
    Remove-Item -Recurse -Force $staging
}
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy compiled files to staging root (for handlers/index.handler)
Copy-Item -Recurse "$dist\*" $staging\

# Also create dist/ subfolder inside staging (so dist/handlers/index.handler also works!)
$stagingDist = "$staging\dist"
New-Item -ItemType Directory -Path $stagingDist | Out-Null
Copy-Item -Recurse "$dist\*" "$stagingDist\"

# Copy package.json with "type": "module"
$pkgJson = @{
    name = "greenpulse-api"
    type = "module"
    version = "1.0.0"
    main = "handlers/index.js"
} | ConvertTo-Json

Set-Content -Path "$staging\package.json" -Value $pkgJson

if (Test-Path $zipOutput) {
    Remove-Item -Force $zipOutput
}

# Compress into GreenPulseAPI.zip
Compress-Archive -Path "$staging\*" -DestinationPath $zipOutput -Force

# Clean up staging directory
Remove-Item -Recurse -Force $staging

$item = Get-Item $zipOutput
Write-Host "Success: Created $($item.FullName) ($($item.Length) bytes)"
