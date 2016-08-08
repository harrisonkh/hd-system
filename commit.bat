@echo off
set /p msg="Enter Commit Message: "
git add .
git commit -am "%msg%"
git push -u origin master