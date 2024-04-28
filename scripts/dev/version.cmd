@echo off
setlocal
set /p "version=Set new semantic version: "
echo ---------------------------------------
echo Will set the version to %version%...
cd ../../app
call npm version %version% --allow-same-version
cd ..
git reset
git add app/package.json
git commit -m "Update version to %version%"
git tag -a v%version% -m "Version %version%"
echo ---------------------------------------
echo Version successfully set to v%version%!
endlocal
pause