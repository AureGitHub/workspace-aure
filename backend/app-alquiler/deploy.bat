powershell -Command "Get-Process deno | Stop-Process -Force"
powershell -Command "Remove-Item -Recurse -Force $env:LOCALAPPDATA\deno"
DENO_DEPLOY_TOKEN=ddp_ZalzIussivgjjHfX13GhmRZYVsYmYm4dwcsZ
deployctl deploy --project=app-arriendo --env-file  --entrypoint=./src/main.ts  --import-map=deno.deploy.json