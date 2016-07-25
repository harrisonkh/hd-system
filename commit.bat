@echo off
set /p msg="Enter Commit Message: "
git commit -am "%msg%"
git push -u origin master