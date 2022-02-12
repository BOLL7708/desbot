set folder=_backups
md %folder% 2>nul
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET hash=%%g)

set archive=%date%_assets_%hash%.7z
7z a -t7z %archive% _assets\*

move %archive% %folder%