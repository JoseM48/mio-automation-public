param(
    [string]$Message
)

# Ir a la raíz del repo
Set-Location "E:\DESARROLLOS\mio-automation"

Write-Host "Verificando estado del repo..."
git status

# Agregar todos los cambios
Write-Host "Agregando cambios..."
git add .

# Si no se pasó mensaje como parámetro, preguntar
if (-not $Message) {
    $Message = Read-Host "Escribe el mensaje para el commit"
}

# Hacer commit
Write-Host "Creando commit con mensaje: $Message"
git commit -m "$Message"

# Hacer push
Write-Host "Subiendo a GitHub..."
git push origin main

Write-Host "Listo, cambios enviados a GitHub."

# Abrir páginas de verificación en el navegador
Start-Process "https://github.com/JoseM48/mio-automation/actions"
Start-Process "https://github.com/JoseM48/mio-automation-public/commits/main"
