param(
    [string]$DeployFolderName = "release-pruebas/cliente",
    [string]$Version = "v1.0",
    [string]$RepoURL = "https://github.com/nova-aftersales/pruebas_entrega_cliente.git"
)

$ErrorActionPreference = "Stop"

try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git no está instalado o no está en el PATH."
    }

    # Carpeta raíz del proyecto
    $root = $PSScriptRoot
    if (-not $root) {
        $root = Get-Location
    }

    # Carpeta padre del proyecto (un nivel por encima)
    $parentDir = Split-Path $root -Parent
    $deployPath = Join-Path $parentDir $DeployFolderName

    # Limpiar carpeta de deploy
    if (Test-Path $deployPath) {
        Remove-Item $deployPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $deployPath | Out-Null

    Write-Host "Copiando archivos desde '$root' a '$deployPath'..."

    Push-Location $root

    # Obtener archivos respetando .gitignore
    $files = git ls-files --cached --others --exclude-standard
    $total = $files.Count
    if ($total -eq 0) {
        Write-Host "No se encontraron archivos para copiar."
        Pop-Location
        exit 0
    }

    $index = 0
    foreach ($file in $files) {
        $index++
        $source = Join-Path $root $file
        $dest = Join-Path $deployPath $file
        $destDir = Split-Path $dest -Parent

        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Copy-Item $source $dest -Force

        $percent = [int](($index / $total) * 100)
        Write-Progress -Activity "Copiando archivos..." `
            -Status "$percent% completado ($index de $total)" `
            -PercentComplete $percent
    }

    Pop-Location
    Write-Progress -Activity "Copiando archivos..." -Completed -Status "Copia completada"
    Write-Host "Copia finalizada correctamente. Se copiaron $total archivos."

    # Inicializar Git en la carpeta de entrega
    Push-Location $deployPath
    git init
    git add .
    git commit -m "Entrega automatizada de la version $Version"

    # Conectar con el repo del cliente
    git remote add origin $RepoURL
    git branch -M main
    git push -u origin main

    # Crear tag de versión
    git tag -a $Version -m "Version $Version"
    git push origin $Version

    Pop-Location
    Write-Host "Entrega automatizada completada. Tag $Version creado y subido a GitHub."

    exit 0
}
catch {
    Write-Progress -Activity "Proceso de entrega..." -Completed -Status "Error"
    Write-Host "Error durante la entrega: $($_.Exception.Message)"
    exit 1
}
