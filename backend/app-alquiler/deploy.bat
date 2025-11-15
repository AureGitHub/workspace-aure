Remove-Item -Recurse -Force "$env:LOCALAPPDATA\deno"
deployctl deploy --project=app-arriendo --env-file  --entrypoint=./src/main.ts  --import-map=deno.deploy.json