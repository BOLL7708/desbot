rem Make sure the _config folder exists
mkdir .\_configs
mkdir .\_settings
mkdir .\src\_configs
mkdir .\src\_data

rem Copy files from templates into the proper locations
CALL :CopyFile .\_templates\config.template.php , .\_configs\config.php
CALL :CopyFile .\_templates\settings_twitch_tokens.template.csv , .\_settings\settings_twitch_tokens.csv
CALL :CopyFile .\src\_templates\config.template.ts , .\src\_configs\config.base.ts
CALL :CopyFile .\src\_templates\secure.template.ts , .\src\_configs\secure.base.ts
CALL :CopyFile .\src\_templates\!keys.template.ts , .\src\_data\!keys.ts
CALL :CopyFile .\src\_templates\games.template.ts , .\src\_data\games.ts
CALL :CopyFile .\src\_templates\presets.template.ts , .\src\_data\presets.ts

rem Remove template from strings
powershell -Command "(gc src\_configs\secure.base.ts) -replace 'KeysTemplate.', 'Keys.' | Out-File -encoding ASCII src\_configs\secure.base.ts"

powershell -Command "(gc src\_configs\config.base.ts) -replace 'KeysTemplate.', 'Keys.' | Out-File -encoding ASCII src\_configs\config.base.ts"
powershell -Command "(gc src\_configs\config.base.ts) -replace 'ControllerPresetsTemplate.', 'ControllerPresets.' | Out-File -encoding ASCII src\_configs\config.base.ts"
powershell -Command "(gc src\_configs\config.base.ts) -replace 'GamePresetsTemplate.', 'GamePresets.' | Out-File -encoding ASCII src\_configs\config.base.ts"
powershell -Command "(gc src\_configs\config.base.ts) -replace 'PipePresetsTemplate.', 'PipePresets.' | Out-File -encoding ASCII src\_configs\config.base.ts"

powershell -Command "(gc src\_data\!keys.ts) -replace 'KeysTemplate', 'Keys' | Out-File -encoding ASCII src\_data\!keys.ts"
powershell -Command "(gc src\_data\presets.ts) -replace 'ControllerPresetsTemplate', 'ControllerPresets' | Out-File -encoding ASCII src\_data\presets.ts"
powershell -Command "(gc src\_data\presets.ts) -replace 'GamePresetsTemplate', 'GamePresets' | Out-File -encoding ASCII src\_data\presets.ts"
powershell -Command "(gc src\_data\presets.ts) -replace 'PipePresetsTemplate', 'PipePresets' | Out-File -encoding ASCII src\_data\presets.ts"

powershell -Command "(gc src\_data\games.ts) -replace 'GamesTemplate', 'Games' | Out-File -encoding ASCII src\_data\games.ts"

rem Done! All necessary files have been now been created.
PAUSE
EXIT /B %ERRORLEVEL%

rem Copy file function
:CopyFile
	echo "No" | COPY /-y %~1 %~2
EXIT /B %ERRORLEVEL%