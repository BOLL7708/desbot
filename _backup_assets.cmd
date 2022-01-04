set folder=_backups
md %folder% 2>nul

set archive=%date%_assets.7z
7z a -t7z %archive% _assets\*

move %archive% %folder%