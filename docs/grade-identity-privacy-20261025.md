# Privacidad de notas — 25 de octubre de 2026

Corrección solicitada y autorizada por el docente, incluida su publicación en la API, sin modificar notas reales.

## Corrección

- La consulta de notas y el identificador de estudiante usado por las actividades pasan por `registered_student_for_profile`: solo se aceptan correos, aliases de correo o identificadores de acceso ya registrados por el personal autorizado.
- Se elimina la coincidencia por nombre visible/alias de nombre y la reclamación de una matrícula mediante parámetros, cabeceras o campos enviados por el visitante. Un identificador vacío no puede coincidir con una ficha sin correo.
- Docentes, administradores del curso y administradores globales mantienen sus roles y su vista de estudiantes. No cambia la lista de cuentas autorizadas ni el sistema de contraseñas/tokens.
- Las respuestas indican `allowStudentIdClaim: false`. Se elimina la activación automática de esa opción en Básico 1, Básico 2 e Intermedio 1. Los valores antiguos almacenados se ignoran; no se ejecuta ninguna migración ni reescritura de las bases académicas.
- Si una cuenta dependía exclusivamente del nombre o de introducir una matrícula, el docente deberá vincular su correo autorizado. La corrección nunca vincula identidades de forma automática ni altera notas para resolver un acceso.

## Validación

- 110 comprobaciones HTTP sobre la API real con almacenamiento temporal y cuentas ficticias: todas pasan, incluidos los 14 casos que reproducían los dos fallos, el acceso de docentes y la publicación individual de calificaciones.
- Nueve pruebas específicas de identidad: correo autorizado, alias de correo, acceso local, nombre coincidente, identificador ajeno, identidad vacía, roles, configuración antigua y ausencia de mutaciones de registros.
- Once pasos de navegador: inicio de sesión real de prueba, progreso entre dos contextos, separación de cuentas, recuperación sin conexión, audio, grabación sintética y recuperación, rúbrica docente, publicación y lectura del feedback propio.
- Regresión de exámenes: 29 pruebas de francés 1/2, 16 de francés 8, 11 del reto de Básico 2 y las suites de oral de Básico 1 y 2 (identidad, emparejamiento autorizado, materiales privados, persistencia, reintentos y notas independientes).

Evidencia sin credenciales: `reports/grade-identity-privacy-20261025.json`. Las identidades de proveedores externos se representan con sesiones firmadas del entorno de prueba; no se usaron cuentas Google/Microsoft reales ni notas reales.

## Publicación

Se publica únicamente `server/progress_api.py` con `tools/deploy_grade_privacy_api.py`: compara el código anterior con producción y el commit padre, valida el candidato, ejecuta las pruebas de identidad, conserva respaldo, reemplaza el archivo de forma atómica y reinicia la API. Si la salud falla, restaura únicamente el código anterior. Compara hashes de las ocho libretas antes y después; nunca escribe ni restaura archivos académicos. La verificación posterior debe probar el módulo desplegado con datos en memoria y comprobar HTTP no autenticado sin consultar fichas reales.

## Publicación verificada

- Commit publicado: `08c6b93ec715b0b21fa282209b2ed5def1071336`. Un solo archivo de producción actualizado: `server/progress_api.py`.
- Respaldo del código y manifiesto: `/var/backups/jaralingua/grade-privacy-api/20261025T230350Z-2tssggvz`.
- SHA-256 publicado: `664dcba61c9229fca1ca7062d9922a13dcc18aa8991bf8f9cc5aafd4b089846b`. Servicio activo y salud HTTP 200.
- Las 110 comprobaciones HTTP se repitieron con el módulo desplegado en un servidor temporal aislado del almacén real: 110 aprobadas, cero fallos. No se usaron cuentas reales.
- Las ocho rutas públicas de notas rechazaron peticiones HTTPS sin sesión con 401.
- Los hashes de las ocho libretas conocidas permanecieron idénticos antes del despliegue, después del reinicio y al terminar la verificación. No se escribieron notas, roles, matrículas ni aliases de alumnos en producción.
- Una consulta opcional al entorno del proceso fue rechazada por revisión automática por posible exposición de secretos. No se reintentó ni se consultó ese entorno por otra vía. La publicación se verificó con los archivos conocidos, pruebas aisladas, hashes del código y salud del servicio.
