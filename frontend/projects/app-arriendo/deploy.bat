@REM Ojo... tiene que estar este archivo en la raiz!! 
@REM netlify.toml
@REM [build]
@REM   command = ""
@REM   publish = "dist/app-arriendo/browser"

@REM [build.environment]
@REM   NETLIFY_USE_FRAMEWORK_DETECTOR = "false"

cd /d C:\Aure
netlify deploy  --dir=C:\Aure\desarrollos\javascript\workspace-aure\frontend\dist\app-arriendo\browser