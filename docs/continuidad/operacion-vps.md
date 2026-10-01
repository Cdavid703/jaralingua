# Operación del proyecto en el VPS

Estado comprobado durante la preparación del entorno el 29 de septiembre de 2026. Verificar de nuevo antes de tareas operativas sensibles.

## Carpetas y acceso

- Desarrollo conectado a GitHub: `/home/jaralingua-dev/projects/jaralingua-git`.
- Copia inicial de referencia del sitio: `/home/jaralingua-dev/projects/jaralingua`. No es el mismo historial Git; no empujar esa copia a main.
- Producción: `/var/www/jaralingua.com`. La copia publicada difiere de GitHub; no sobrescribirla completa.
- Datos operativos privados: `/var/lib/jaralingua`. No copiarlos al repositorio ni usarlos como fixtures de pruebas.
- Usuario de desarrollo sin sudo: `jaralingua-dev`. Se bloqueó expresamente su acceso a la carpeta publicada mediante ACL.
- Sesión persistente: `tmux`, sesión `jaralingua`. Conserva procesos al desconectar el cliente, no garantiza supervivencia a reinicios del VPS ni ejecución sin pausas de aprobación.

## Codex

Iniciar en la copia GitHub con `~/bin/start-codex-git`; reanudar con `~/bin/start-codex-git resume`. La instalación propia del usuario está bajo `~/.local`; npm utiliza ese prefijo para evitar EACCES al actualizar. No dar permisos globales sobre `/opt` ni ejecutar Codex como root para solucionar ese error.

La autenticación ChatGPT fue comprobada sin transferir tokens de otro usuario. Cada conversación nueva necesita el contexto de estos documentos; no tiene el historial de este chat automáticamente.

## GitHub

Repositorio `Cdavid703/jaralingua`, origin SSH. Una deploy key de escritura exclusiva para este repositorio se creó dentro del VPS; su clave privada no salió del servidor. Las claves públicas del host GitHub están fijadas. Se verificó `git push --dry-run origin HEAD:refs/heads/main`, sin cambiar ramas.

El push ya no depende del computador ni del conector del chat. Eso no significa commit automático, permiso para publicar cualquier cambio ni acceso a otros repositorios. No ejecutar `gh auth login` innecesariamente: Git usa la clave SSH.

Antes de commit y push, revisar cambios y rutas explícitas. No force push, no reset destructivo y no asumir que autorizaciones históricas siguen vigentes para cambios nuevos.

## Publicación

El administrador dispone de `/usr/local/sbin/jaralingua-publish`. Recibe un SHA completo y archivos estáticos explícitos. Por defecto solo muestra una vista previa:

```bash
/usr/local/sbin/jaralingua-publish --commit FULL_SHA ingles/basico-2/index.html
```

Solo tras revisión y autorización de publicación, añadir `--apply` al mismo comando. El commit debe estar contenido en `origin/main`; el script hace fetch. No se concedió sudo al usuario de desarrollo.

El publicador guarda archivos anteriores y manifiesto en `/var/backups/jaralingua/vps-publish`. Reemplaza cada archivo de forma atómica, pero el conjunto no es una transacción única. Verificar después de publicar y revisar el manifiesto antes de una recuperación. No acepta carpetas, eliminaciones, backend ni bases de datos.

Cambios de API necesitan un procedimiento independiente con pruebas, respaldo y autorización. Servicio existente: `jaralingua-progress-api`. No reiniciarlo por un cambio de contenido estático.

## Seguridad de la continuidad

Estos documentos no contienen credenciales ni datos individuales de alumnos. No añadir contraseñas, tokens, claves privadas o listados de notas para facilitar futuros chats. Leer registros académicos únicamente para una petición autorizada y conservar su separación por curso.
