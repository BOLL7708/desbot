Opt("SendKeyDelay", 20)
Local $count = $CmdLine[0]
If $count == 2 Then
	Local $window = $CmdLine[1]
	Local $command = $CmdLine[2]
	Local $active = WinActivate($window)
	If $active Then
		Send($command)
	EndIf
EndIf
