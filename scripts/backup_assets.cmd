@echo off
setlocal
cd ../_user
set folder=backups
md %folder% 2>nul
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET hash=%%g)
set cleandate=%date:/=-%
set archive=%cleandate%_assets_%hash%.7z
7z a -t7z %archive% assets\*
move %archive% %folder%
endlocal
echo.
echo "************************************************"
echo "* Backup created: %archive% *"
echo "************************************************"