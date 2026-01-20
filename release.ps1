param(
    [string]$DeployFolderName = "release-pruebas/cliente",
    [string]$Version = $(Read-Host "Introduce la version (ej: v1.1)"),
    # Pedimos el token de forma segura (se verán asteriscos)
    [System.Security.SecureString]$SecureToken = $(Read-Host "Introduce tu GitHub Access Token" -AsSecureString),
   # [string]$RepoBaseURL = "github.com/nova-aftersales/pruebas_entrega_cliente.git"
   [string]$RepoBaseURL = "github.com/dsegurap-nova/test_release.git"
)
# A - Convertimos el token seguro a texto plano solo para construir la URL de Git
$BstrToken = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
$PlainTextToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BstrToken)

# B - Construimos la URL con el token para la autenticación
$RepoURL = "https://$($PlainTextToken)@$RepoBaseURL"

# C-  Validación del token: probamos acceso al repositorio 
Write-Host "Validando token y acceso al repositorio..." -ForegroundColor Gray
$testAuth = git ls-remote $RepoURL -h HEAD 2>$null
if ($null -eq $testAuth) {
    # Limpiamos la memoria antes de lanzar el error
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BstrToken)
    throw "El token no es válido o no tienes acceso al repositorio. Revisa los permisos (scopes) del token."
}

# D - Limpieza de seguridad: borramos el rastro del token de la memoria de inmediato
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BstrToken)


$ErrorActionPreference = "Stop"

try {
    # 1. Definir rutas
    $root = $PSScriptRoot
    if (-not $root) { $root = Get-Location }
    $parentDir = Split-Path $root -Parent
    $deployPath = Join-Path $parentDir $DeployFolderName

    Write-Host "--- Preparando entrega de la version $Version ---" -ForegroundColor Cyan

    # 2. Crear carpeta si no existe o limpiar si existe (manteniendo .git)
    if (-not (Test-Path $deployPath)) {
        New-Item -ItemType Directory -Path $deployPath | Out-Null
        Write-Host "Carpeta de entrega creada por primera vez."
    }
    else {
        Write-Host "Limpiando version anterior (manteniendo historial Git)..."
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
    else {
        # ¡IMPORTANTE! Actualizamos la URL para usar el token nuevo que acabas de introducir
        git remote set-url origin $RepoURL
        
        Write-Host "Sincronizando historial con GitHub..."
        git fetch origin
        git reset --soft origin/main 
    }

    # Añadir cambios
    git add -A
    
    if (git status --porcelain) {
        git commit -m "Entrega version $Version"
        
        if (git tag -l $Version) {
            Write-Host "⚠️ El tag $Version ya existe. Borrando tag local anterior para actualizar..." -ForegroundColor Yellow
            git tag -d $Version
        }
        git tag -a $Version -m "Tag para la version $Version"
        
        Write-Host "Subiendo cambios al repositorio del cliente..." -ForegroundColor Cyan
        # Pull con estrategia de union para asegurar que el historial continúe
        git push origin main
        git push origin $Version --force # Forzamos el tag por si ya existía
        
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