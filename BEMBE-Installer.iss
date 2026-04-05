; ✦ BEMBE ✦ - Instalador para Windows v3.1.0
; Sincronización en la Nube + Logo + Horario Completo

#define MyAppName "BEMBE - Sistema de Gestión"
#define MyAppVersion "3.1.0"
#define MyAppPublisher "Escuela Bembe"
#define MyAppExeName "BEMBE.exe"
#define MyAppURL "https://bembespb.ru"

[Setup]
; Información básica
AppId={{B8E4E5F0-1234-5678-90AB-CDEF12345678}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Archivos y directorios
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\Installer-Output
OutputBaseFilename=BEMBE-Installer-v{#MyAppVersion}

; Compresión
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardSizePercent=100,100

; Privilegios y arquitectura
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64
ArchitecturesAllowed=x64

; Configuracion visual
SetupIconFile=INCONO-BEMBE.png
WizardSmallImageFile=INCONO-BEMBE.png

; Contraseña (opcional)
; Encryption=yes
; Password=tu_contraseña_aqui

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "Crear icono en barra de tareas"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Archivo principal HTML
Source: "CODIGO OK.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "INCONO-BEMBE.png"; DestDir: "{app}"; Flags: ignoreversion

; Documentación
Source: "GUIA_COMPLETA_DESPLIEGUE.md"; DestDir: "{app}\Documentacion"; Flags: ignoreversion
Source: "CAMBIOS_REALIZADOS.md"; DestDir: "{app}\Documentacion"; Flags: ignoreversion
Source: "RESUMEN_FINAL.md"; DestDir: "{app}\Documentacion"; Flags: ignoreversion

; Backend (opcional para uso local)
Source: "backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs
Source: "frontend\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs

[Icons]
; Icono en menú inicio
Name: "{group}\{#MyAppName}"; Filename: "{app}\CODIGO OK.html"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{group}\Documentación"; Filename: "{app}\Documentacion"

; Icono en escritorio
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\CODIGO OK.html"; Tasks: desktopicon

[Run]
; Abrir aplicación después de instalar
Filename: "{app}\CODIGO OK.html"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent shellexec

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  
  // Verificar si ya existe una versión instalada
  if RegKeyExists(HKLM, 'Software\Microsoft\Windows\CurrentVersion\Uninstall\{#SetupSetting("AppId")}_is1') then
  begin
    if MsgBox('Ya existe una versión de BEMBE instalada. ¿Desea desinstalarla primero?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      // Ejecutar desinstalación
      Exec(ExpandConstant('{uninstallexe}'), '', '', SW_SHOWNORMAL, ewWaitUntilTerminated, Result);
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Crear acceso directo en barra de tareas si se seleccionó
    if IsTaskSelected('quicklaunchicon') then
    begin
      // Código para crear acceso directo en taskbar
    end;
  end;
end;

function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;
