@echo off
setlocal enabledelayedexpansion

REM Set report directory to the current working directory
set "REPORT_DIR=%CD%"
set "REPORT_FILE=%REPORT_DIR%\report.html"
set "JSON_FILE=%REPORT_DIR%\report.json"
set "COLLECTION=Collection.json"
set "ENVIRONMENT=Environment.json"

echo Running collection...
call newman run "%COLLECTION%" -e "%ENVIRONMENT%" --reporters cli,htmlextra,json ^
  --reporter-htmlextra-export "%REPORT_FILE%" ^
  --reporter-json-export "%JSON_FILE%" ^
  --reporter-htmlextra-title "Test Report" ^
  --reporter-htmlextra-browserTitle "Test Report" ^
  --reporter-htmlextra-darkTheme

set "NEWMAN_ERROR=!errorlevel!"

if exist "%REPORT_FILE%" if exist "%JSON_FILE%" (
    echo ✅ Report and JSON files generated at:
    echo    HTML : "%REPORT_FILE%"
    echo    JSON : "%JSON_FILE%"
    
    echo Opening report...
    start "" "%REPORT_FILE%"
    set "REPORT_STATUS=Report opened successfully"

    echo Sending email with summary...
    node sendMail.js
    if errorlevel 1 (
        echo ❌ ERROR: Failed to send email.
    ) else (
        echo ✅ Email sent successfully.
    )
) else (
    echo ❌ ERROR: One or both report files were not generated.
    set "REPORT_STATUS=** REPORT GENERATION FAILED **"
)

echo --------------------------------------
echo Newman exit code : !NEWMAN_ERROR!
echo Report status    : !REPORT_STATUS!
echo --------------------------------------

pause
