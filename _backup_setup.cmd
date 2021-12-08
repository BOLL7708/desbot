set folder=backups
md %folder% 2>nul

set archive=%date%_setup.7z
7z a -t7z %archive% config.php
7z a -t7z %archive% settings\*.csv -xr!*template*
7z a -t7z %archive% src\config.*.ts -xr!*template*
7z a -t7z %archive% src\secure.*.ts -xr!*template*
7z a -t7z %archive% src\data\*.ts -xr!*template*

move %archive% %folder%