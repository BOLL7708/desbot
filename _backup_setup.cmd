set folder=_backups
md %folder% 2>nul
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET hash=%%g)

set archive=%date%_setup_%hash%.7z
7z a -t7z %archive% _configs\*
7z a -t7z %archive% _settings\*
7z a -t7z %archive% src\_configs\*
7z a -t7z %archive% src\_data\*

move %archive% %folder%