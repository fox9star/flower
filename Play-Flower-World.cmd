@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -Command "$port=4173; $client=[System.Net.Sockets.TcpClient]::new(); $ready=$false; try { $client.Connect('127.0.0.1',$port); $ready=$client.Connected } catch { $ready=$false } finally { $client.Dispose() }; if (-not $ready) { $site=Join-Path '%CD%' 'docs'; $python=Get-Command python -ErrorAction Stop; Start-Process -FilePath $python.Source -ArgumentList @('-m','http.server',$port,'--bind','127.0.0.1','--directory',$site) -WindowStyle Hidden; Start-Sleep -Milliseconds 800 }; Start-Process ('http://127.0.0.1:'+$port+'/')"
