; This is used to execute console commands in games.
; It needs your Apache + PHP to not run as a service
; as services cannot touch GUI windows.

; To use this, compile it with AutoIt v3 to run.exe
; https://www.autoitscript.com/site/autoit/downloads/

; Increase delay if game console misses characters
Opt("SendKeyDelay", 20)
Local $count = $CmdLine[0]
If $count == 2 Then
	; Get active window title
	Local $oldWindow = WinGetTitle("[active]")

	; Get parameters and activate window
	Local $window = $CmdLine[1]
	Local $command = $CmdLine[2]
	Local $active = WinActivate($window)
	
	; Send console command to window
	If $active Then
		SendKeepActive($window)
		Send($command)
		SendKeepActive("")
	Else
		MsgBox(48, "Window not found!", "Title: " & $window & @CRLF & "Command: " & $command)
	EndIf

	; Set focus back to previous window
	WinActivate($oldWindow)
EndIf
