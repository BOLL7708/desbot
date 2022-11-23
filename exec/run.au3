#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_UseX64=y
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****
; This is used to execute console commands in games.
; It needs your Apache + PHP to not run as a service
; as services cannot touch GUI windows.

; To use this, compile it with AutoIt v3 to run.exe
; https://www.autoitscript.com/site/autoit/downloads/

; Increase delay if game console misses characters
Opt("SendKeyDelay", 20)
Local $count = $CmdLine[0]
If $count == 3 Then
	; Get active window title
	Local $oldWindow = WinGetTitle("[active]")

	; Get parameters and activate window
	Local $window = $CmdLine[1]
	Local $type = $CmdLine[2]
	Local $command = $CmdLine[3]
	Local $active = WinActivate($window)

	; Send console command to window
	If $active Then
		If($type == "keys") Then
			SendKeepActive($window)
			Send($command)
			SendKeepActive("")
		ElseIf($type == "mouse") Then
			$winLoc = WinGetPos($window)
			MouseMove($winLoc[0]+($winLoc[2]/2),$winLoc[1]+($winLoc[3]/2), 0)
			$commandArr = StringSplit($command, "")
			For $c In $commandArr
				Switch $c
					Case "u" ; Mouse wheel up
						MouseWheel("up", 1)
					Case "d" ; Mouse wheel down
						MouseWheel("down", 1)
					Case "l" ; Left mouse click
						MouseClick("left")
					Case "r" ; Right mouse click
						MouseClick("right")
					Case "m" ; Middle mouse click
						MouseClick("middle")
					Case "p" ; Primary mouse click
						MouseClick("primary")
					Case "s" ; Secondary mouse click
						MouseClick("secondary")
				EndSwitch
				Sleep(20)
			Next
		EndIf
	Else
		MsgBox(48, "Window not found!", "Title: " & $window & @CRLF & "Command: " & $command)
	EndIf

	; Set focus back to previous window
	WinActivate($oldWindow)
EndIf
