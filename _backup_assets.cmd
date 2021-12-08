set folder=backups
md %folder% 2>nul

set archive=%date%_assets.7z
7z a -t7z %archive% assets\*

move %archive% %folder%