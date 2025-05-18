@echo off
echo Packaging Performance Insights extension...

REM Create build directory
if not exist build mkdir build

REM Copy required files
echo Copying files...
xcopy /E /I /Y manifest.json build\
xcopy /E /I /Y popup.html build\
xcopy /E /I /Y popup.js build\
xcopy /E /I /Y icons build\icons
copy README.md build\
copy LICENSE build\
copy PRIVACY.md build\

REM Create zip file
echo Creating zip archive...
powershell Compress-Archive -Path build\* -DestinationPath performance-insights.zip -Force

echo Package created: performance-insights.zip
echo You can now upload this file to the Chrome Web Store Developer Dashboard. 