@echo off
rem ============================================================
rem  Plataforma Logistica PLANSA - iniciar y abrir
rem  1) Inicia el servidor (si no esta corriendo)
rem  2) Publica la plataforma en la red privada Tailscale (HTTPS, solo tailnet)
rem  3) Abre la plataforma en el navegador
rem ============================================================
setlocal
cd /d "%~dp0"
set "PORT=4173"
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"
set "URL=http://127.0.0.1:%PORT%/"

where node >nul 2>&1 || (
  echo [ERROR] No se encontro Node.js. Instalarlo desde https://nodejs.org ^(version 18 o superior^).
  pause
  exit /b 1
)

netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul
if errorlevel 1 (
  echo Iniciando servidor de la plataforma...
  start "PLANSA - servidor (no cerrar)" /min cmd /c "node backend\server.js >> plataforma.log 2>&1"
  ping -n 3 127.0.0.1 >nul
) else (
  echo El servidor ya estaba en ejecucion.
)

if exist "%TS%" (
  "%TS%" serve --bg --https=443 http://127.0.0.1:%PORT% >nul 2>&1
  for /f "usebackq delims=" %%h in (`powershell -NoProfile -Command "try { ((& '%TS%' status --json | ConvertFrom-Json).Self.DNSName).TrimEnd('.') } catch { '' }"`) do set "TSHOST=%%h"
)
if defined TSHOST (
  set "URL=https://%TSHOST%/"
  echo Acceso por Tailscale: https://%TSHOST%/
) else (
  echo Tailscale no disponible: solo acceso local.
)
echo Acceso local:         http://127.0.0.1:%PORT%/

start "" "%URL%"
ping -n 5 127.0.0.1 >nul
endlocal
