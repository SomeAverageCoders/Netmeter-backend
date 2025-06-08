@echo off
REM ===================================================
REM Network Monitor EXE Builder - Debug Version
REM ===================================================

setlocal enabledelayedexpansion

echo.
echo Building NetworkMonitor.exe with debug support
echo.

REM Check Python
where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found in PATH
    pause
    exit /b 1
)

REM Install PyInstaller if needed
python -m pip install --upgrade pyinstaller --user

REM Clean previous builds
if exist "build" rmdir /s /q build
if exist "dist" rmdir /s /q dist
if exist "NetworkMonitor.spec" del NetworkMonitor.spec

REM Build with debug options
echo.
echo Building executable...
python -m PyInstaller ^
    --onefile ^
    --clean ^
    --name NetworkMonitor ^
    --add-data "network_monitor.py;." ^
    --hidden-import logging ^
    --hidden-import json ^
    --hidden-import subprocess ^
    --hidden-import threading ^
    --hidden-import argparse ^
    --hidden-import datetime ^
    --hidden-import pathlib ^
    --hidden-import base64 ^
    --runtime-tmpdir . ^
    --console ^
    --noconfirm ^
    network_monitor.py

if not exist "dist\NetworkMonitor.exe" (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Build successful! Executable created in: dist\NetworkMonitor.exe
echo.

REM Create debug batch file
echo @echo off > dist\debug.bat
echo NetworkMonitor.exe %%* ^> output.log 2^>^&1 >> dist\debug.bat
echo notepad output.log >> dist\debug.bat

echo To debug, run: dist\debug.bat
echo.
pause