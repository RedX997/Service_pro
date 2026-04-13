@echo off
echo Creating database backup...
pg_dump -h localhost -U postgres -d servicepro > servicepro_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
echo Backup created: servicepro_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
pause