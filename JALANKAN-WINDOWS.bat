@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum ditemukan. Pasang Node.js yang sesuai README, lalu coba lagi.
  pause
  exit /b 1
)
echo Membuka server preview Brain Arena...
echo Buka http://localhost:4173 di browser setelah server siap.
node scripts\serve.mjs
pause
