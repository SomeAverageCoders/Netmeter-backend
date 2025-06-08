@echo off 
NetworkMonitor.exe %* > output.log 2>&1 
notepad output.log 
