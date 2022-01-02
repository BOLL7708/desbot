set folder=backups
md %folder% 2>nul

set archive=%date%_setup.7z
7z a -t7z %archive% _configs\*
7z a -t7z %archive% _settings\*
7z a -t7z %archive% src\_configs\*
7z a -t7z %archive% src\_data\*

move %archive% %folder%