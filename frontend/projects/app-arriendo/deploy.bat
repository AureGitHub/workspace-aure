@REM Ojo... lo tengo que ejecutar desde cualquier carpeta que no tenga angular
@REM para que solo suba la distribución

@REM Ojo con --prod lo publica en "produccion". Si no pongo prod, lo publica en otra direccion para poder probar

cd /d C:\Aure
netlify deploy --prod  --dir=C:\Aure\desarrollos\javascript\workspace-aure\frontend\dist\app-arriendo\browser