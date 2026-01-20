param(
    [string]$DeployFolderName = "release-pruebas/cliente",
    [string]$Version = $(Read-Host "Introduce la versión (ej: v1.1)"),
    [string]$RepoURL = "https://github.com/nova-aftersales/pruebas_entrega_cliente.git"
)

$ErrorActionPreference = "Stop"

try {
    # 1. Definir rutas
    $root = $PSScriptRoot
    if (-not $root) { $root = Get-Location }
    $parentDir = Split-Path $root -Parent
    $deployPath = Join-Path $parentDir $DeployFolderName

    Write-Host "--- Preparando entrega de la versión $Version ---" -ForegroundColor Cyan

    # 2. Crear carpeta si no existe o limpiar si existe (manteniendo .git)
    if (-not (Test-Path $deployPath)) {
        New-Item -ItemType Directory -Path $deployPath | Out-Null
        Write-Host "Carpeta de entrega creada por primera vez."
    }
    else {
        Write-Host "Limpiando versión anterior (manteniendo historial Git)..."
        # Borra todo menos la carpeta .git
        Get-ChildItem -Path $deployPath -Exclude ".git" | Remove-Item -Recurse -Force
    }

    # 3. Copiar archivos nuevos (equivalente a tu robocopy pero respetando .gitignore)
    Push-Location $root
    $files = git ls-files --cached --others --exclude-standard
    foreach ($file in $files) {
        $dest = Join-Path $deployPath $file
        $destDir = Split-Path $dest -Parent
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        Copy-Item (Join-Path $root $file) $dest -Force
    }
    Pop-Location

    # 4. Operaciones de Git en la carpeta de entrega
    Push-Location $deployPath

    # Inicializar solo si es la primera vez
    if (-not (Test-Path ".git")) {
        Write-Host "Inicializando repositorio por primera vez..." -ForegroundColor Yellow
        git init
        git remote add origin $RepoURL
        git branch -M main
    }

    # Añadir cambios (Git detectará archivos nuevos, modificados y ELIMINADOS)
    git add -A
    
    # Comprobar si hay algo que enviar
    if (git status --porcelain) {
        git commit -m "Entrega versión $Version"
        git tag -a $Version -m "Tag para la versión $Version"
        
        Write-Host "Subiendo cambios al repositorio del cliente..." -ForegroundColor Cyan
        # IMPORTANTE: Sin -f para no borrar el historial previo
        git push origin main
        git push origin $Version
        
        Write-Host "✅ Entrega exitosa. Historial conservado." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ No hay cambios detectados respecto a la entrega anterior." -ForegroundColor Yellow
    }

    Pop-Location
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}