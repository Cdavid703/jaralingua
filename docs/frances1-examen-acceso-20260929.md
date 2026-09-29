# Incidencia de acceso al examen final — 29 de septiembre de 2026

El servicio `jaralingua-progress-api.service` corre como `www-data`.
La grilla `/var/lib/jaralingua/french1-grades.json` tenía propietario
`root:root` y permisos `0600`. El registro del servicio mostraba
`PermissionError` al verificar el acceso. El estado del examen también
pertenecía a `root`, lo que impedía su modificación por el servicio.

Se corrigió exclusivamente el propietario de la grilla y del estado del
examen a `www-data:www-data`, con permisos privados `0600`.
No hizo falta reiniciar el servicio ni modificar notas, estudiantes o el
estado de apertura. El examen permaneció cerrado para estudiantes.

Verificación por HTTPS con credenciales internas de diagnóstico de 120 segundos:

- Las dos cuentas registradas de la profesora reciben HTTP 200, rol `teacher`
  y las cuatro secciones del examen.
- La cuenta administradora global recibe HTTP 200, rol `admin` y las cuatro
  secciones del examen.
- El servicio puede leer la grilla y escribir el estado del examen.

La prueba verifica autorización y contenido en el servidor. No simula el
diálogo de Google en los dispositivos personales de los usuarios.

Se ajustó `tools/reset_french1_cohort.py` para que las nuevas escrituras
hereden el propietario del directorio privado del servicio y mantengan
permisos `0600`, en lugar de perpetuar un propietario `root` del archivo.
No volver a ejecutar el reseteo para reparar permisos: borraría entregas.
