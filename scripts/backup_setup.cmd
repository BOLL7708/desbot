@echo off
set folder=_backups
md %folder% 2>nul
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET hash=%%g)
set cleandate=%date:/=-%
set archive=%cleandate%_setup_%hash%.7z
7z a -t7z %archive% _db\*
7z a -t7z %archive% _data\*
move %archive% %folder%
echo.
echo "***********************************************"
echo "* Backup created: %archive% *"
echo "***********************************************"