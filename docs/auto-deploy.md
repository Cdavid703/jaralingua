# Auto deploy despues de cada commit

Este repo puede empujar automaticamente cada commit a GitHub y, si hay VPS configurado, actualizar produccion por SSH.

## Archivos

- `.githooks/post-commit`: hook versionado que corre despues de cada commit.
- `scripts/post-commit-sync.ps1`: hace `git push` y luego deploy al VPS.
- `scripts/install-auto-sync.ps1`: activa el hook localmente con `core.hooksPath`.
- `deploy.example.env`: plantilla segura.
- `deploy.local.env`: configuracion real local, ignorada por Git.
- `.jaralingua-local/`: carpeta local portable para llaves o secretos; ignorada por Git.

## Activar en esta maquina

```powershell
.\scripts\install-auto-sync.ps1 -CreateLocalConfig
```

Despues edita `deploy.local.env` con los datos del VPS.

Si la carpeta vive en una memoria extraible, puedes guardar la llave SSH dentro del repo local sin subirla a Git:

```env
VPS_SSH_KEY=.jaralingua-local/ssh/jaralingua_vps_ed25519
```

El script copia esa llave a una ubicacion temporal del computador y arregla permisos antes de llamar a `ssh`, para que funcione incluso si la memoria no soporta permisos tipo NTFS.

## Configurar el VPS

El deploy asume que el VPS ya tiene un clon del repo. Ejemplo:

```bash
cd /var/www
git clone https://github.com/Cdavid703/jaralingua.git jaralingua
```

Luego en `deploy.local.env`:

```env
AUTO_DEPLOY_BRANCH=main
AUTO_DEPLOY_REMOTE=origin
VPS_SSH_TARGET=deploy@tu-vps.example.com
VPS_APP_DIR=/var/www/jaralingua
VPS_SSH_KEY=.jaralingua-local/ssh/jaralingua_vps_ed25519
```

Si el sitio necesita recargar Nginx u otro servicio:

```env
VPS_POST_DEPLOY_COMMAND=systemctl reload nginx
```

## Probar sin hacer commit

```powershell
.\scripts\post-commit-sync.ps1
```

Para probar solo GitHub:

```powershell
.\scripts\post-commit-sync.ps1 -SkipVps
```

Para probar solo el tramo VPS con la configuracion local:

```powershell
.\scripts\post-commit-sync.ps1 -SkipPush
```

## Apagar temporalmente

En `deploy.local.env`:

```env
AUTO_DEPLOY_DISABLE=1
```
