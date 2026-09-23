@echo off
rem ============================================================
rem  Plataforma Logistica PLANSA - detener
rem  Detiene el servidor y retira la publicacion en Tailscale.
rem ============================================================
setlocal
set "PORT=4173"
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1 && echo Servidor detenido ^(PID %%p^).
)
if exist "%TS%" "%TS%" serve --https=443 off >nul 2>&1 && echo Publicacion en Tailscale retirada.
ping -n 4 127.0.0.1 >nul
endlocal
