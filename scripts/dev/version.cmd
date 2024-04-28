@echo off
setlocal
set /p "version=Set new version: "
cd ../../app
start /wait npm version %version% --allow-same-version
cd ..
git reset
git add app/package.json
git commit -m "Update version to %version%"
git tag -a %version% -m "Version %version%"
echo "Version update complete!"
endlocal
pause