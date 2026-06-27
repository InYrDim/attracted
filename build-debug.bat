@echo off
bun run build > build.log 2>&1
echo EXIT CODE: %ERRORLEVEL%
type build.log
