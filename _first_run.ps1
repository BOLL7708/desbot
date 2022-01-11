Write-Output '==============================='
Write-Output ' Initializing Streaming Widget '
Write-Output '==============================='

# Check powershell version
$majorVersion = $PSVersionTable.PSVersion.Major # (Get-Host).Version
if($majorVersion -le 6) {
    Write-Warning 'This script requires PowerShell 6 or greater to run.'
    $confirmation = Read-Host "Do you want to open the webpage where you can download the latest version? (y/n) "
    if ($confirmation -eq 'y') {
        Start-Process 'https://github.com/PowerShell/PowerShell/releases/latest'
    }
    exit 1
}

# Reset the current directory to the location of the script
[System.Environment]::CurrentDirectory = (Get-Location).Path 

# Functions
function Add-DirIfMissing {
    param ($Path)
    if (!(Test-Path -Path $Path)) {
        Write-Output "Creating directory $Path"
        [void](New-Item -ItemType Directory -Path $Path)
    } else {
        Write-Warning "Directory already exists: $Path"
    }
}
function Copy-FileIfMissing {
    param ($Path, $Destination)
    if (!(Test-Path -Path $Destination)) {
        Write-Output "Copying $Path to $Destination"
        Copy-Item -Path $Path -Destination $Destination
    } else {
        Write-Warning "File already exists: $Destination"
    }
}
function Rename-InternalNames {
    param ($Path, $Name, $NewName)
    if (Test-Path -Path $Path) {
        Write-Output "Replacing '$Name' with '$NewName' in: $Path"
        (Get-Content -Path $Path -Raw) -replace $Name, $NewName | Set-Content -Path $Path
    } else {
        Write-Warning "File $Path does not exist"
    }
}

Write-Output '', 'Make sure the needed folders exist'
Add-DirIfMissing -Path '_configs'
Add-DirIfMissing -Path '_settings'
Add-DirIfMissing -Path '_assets'
Add-DirIfMissing -Path 'src\_configs'
Add-DirIfMissing -Path 'src\_data'

Write-Output '', 'Copy files from templates into the their proper locations'
Copy-FileIfMissing -Path 'templates\config.template.php' -Destination '_configs\config.php'
Copy-FileIfMissing -Path 'src\templates\config.template.ts' -Destination 'src\_configs\config.ts'
Copy-FileIfMissing -Path 'src\templates\!keys.template.ts' -Destination 'src\_data\!keys.ts'
Copy-FileIfMissing -Path 'src\templates\games.template.ts' -Destination 'src\_data\games.ts'
Copy-FileIfMissing -Path 'src\templates\presets.template.ts' -Destination 'src\_data\presets.ts'

Write-Output '', 'Rename internal names in copied files'
Rename-InternalNames -Path 'src\_configs\config.ts' -Name 'KeysTemplate.' -NewName 'Keys.'
Rename-InternalNames -Path 'src\_configs\config.ts' -Name 'ControllerPresetsTemplate.' -NewName 'ControllerPresets.'
Rename-InternalNames -Path 'src\_configs\config.ts' -Name 'GamesTemplate.' -NewName 'Games.'
Rename-InternalNames -Path 'src\_configs\config.ts' -Name 'GamePresetsTemplate.' -NewName 'GamePresets.'
Rename-InternalNames -Path 'src\_configs\config.ts' -Name 'PipePresetsTemplate.' -NewName 'PipePresets.'
Rename-InternalNames -Path 'src\_data\!keys.ts' -Name 'KeysTemplate' -NewName 'Keys'
Rename-InternalNames -Path 'src\_data\presets.ts' -Name 'ControllerPresetsTemplate' -NewName 'ControllerPresets'
Rename-InternalNames -Path 'src\_data\presets.ts' -Name 'GamePresetsTemplate' -NewName 'GamePresets'
Rename-InternalNames -Path 'src\_data\presets.ts' -Name 'PipePresetsTemplate' -NewName 'PipePresets'
Rename-InternalNames -Path 'src\_data\games.ts' -Name 'GamesTemplate' -NewName 'Games'

Write-Output '', 'Done! All necessary files should have been created.'