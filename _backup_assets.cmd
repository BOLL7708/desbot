@echo off
set folder=_backups
md %folder% 2>nul
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET hash=%%g)
set cleandate=%date:/=-%
set archive=%cleandate%_assets_%hash%.7z
7z a -t7z %archive% _assets\*
move %archive% %folder%
echo.
echo "************************************************"
echo "* Backup created: %archive% *"
echo "************************************************"