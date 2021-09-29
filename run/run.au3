Local $count = $CmdLine[0]
If $count == 2 Then
	Local $window = $CmdLine[1]
	Local $command = $CmdLine[2]
	WinActivate($window)
	Send($command)
EndIf
