@echo off
echo Starting CoolZone WebApp...
echo.

:: Check if backend is running
netstat -ano | findstr :5050 >nul
if %errorlevel% equ 0 (
    echo Backend is already running on port 5050
) else (
    echo Starting backend server on port 5050...
    start "CoolZone Backend" cmd /k "cd /d %~dp0backend && npm start"
    echo Waiting for backend to start...
    timeout /t 3 /nobreak >nul
)

:: Check if frontend is running
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo Frontend is already running on port 5173
) else (
    echo Starting frontend development server on port 5173...
    start "CoolZone Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
)

echo.
echo CoolZone WebApp is now running!
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5050
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq CoolZone Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq CoolZone Frontend*" /T /F >nul 2>&1
echo Servers stopped.
pause
