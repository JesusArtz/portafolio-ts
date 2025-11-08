# Portafolio (Neon)  Next.js monolítico

Este repositorio contiene un sitio web de portafolio monolítico hecho con Next.js (app router) y React, con un pequeño panel de administración para crear/editar/borrar entradas de "Projects" y "Education". Tiene un estilo "neon" y soporte para subir imágenes que se almacenan en `public/uploads`.

## Características principales

- Página pública con presentación, skills y cards para Projects y Education.
- Panel de administración en `/admin` para crear, editar y borrar items.
- Autenticación simple basada en credenciales definidas en `.env.local` y cookies firmadas.
- Almacenamiento de datos en desarrollo mediante `data/db.json` (JSON fallback). Se diseñó para evitar compilaciones nativas en Windows.
- Soporte de subida de imágenes (cliente envía base64, servidor guarda en `public/uploads`).

## Tecnologías

- Next.js (app directory)
- React
- CSS (archivo principal: `app/globals.css`) con estilo neon
- DB: `lib/db.ts` (JSON-file fallback en `data/db.json`)  opción elegida por compatibilidad en entorno Windows

## Empezar (desarrollo)

1. Instala dependencias:

```powershell
npm install
```

2. Crea un archivo `.env.local` en la raíz con estas variables (ejemplo):

```text
ADMIN_USER=admin
ADMIN_PASS=admin
AUTH_SECRET=pon-aqui-un-secreto-largo
```

3. Levanta el servidor de desarrollo:

```powershell
npm run dev
```

4. Abre http://localhost:3000

## Admin y credenciales

- La interfaz de administración está en `/admin`. Por diseño no aparece enlazada en la página principal.
- Para acceder debes hacer login con `ADMIN_USER` y `ADMIN_PASS` tal como se definan en `.env.local`.

## Almacenamiento de datos

- Desarrollo: `data/db.json` es el almacenamiento principal. Las utilidades están en `lib/db.ts`.
- Nota: se intentaron soluciones con SQLite nativo y con sql.js (WASM), pero por compatibilidad y para evitar que el desarrollador necesite toolchains adicionales en Windows, se dejó la implementación JSON como fallback de desarrollo. Migración a SQLite/Prisma es posible más adelante.

## Subida de imágenes

- El cliente lee la imagen como Data URL (base64) y la envía en el body JSON a `/api/upload` o `/api/edit`.
- El servidor decodifica y guarda el archivo en `public/uploads/` y guarda la URL relativa en la entrada de la DB (`/uploads/<filename>`).
- Archivos subidos se encuentran en `public/uploads/`.

## API rápida (endpoints relevantes)

- GET  /api/data       devuelve { projects, education }
- POST /api/upload     crear item (tipo: project|education) y aceptar `imageData` + `imageName`
- POST /api/edit       editar item; acepta `imageData` para reemplazar o `imageData === null` para eliminar
- POST /api/delete     eliminar item
- POST /api/login      login admin (genera cookie firmada)
- POST /api/logout     cerrar sesión
- GET  /api/session    verificar sesión actual

## Firmar commits (GPG)

- Puedes firmar commits nuevos configurando GPG y `git config --global commit.gpgSign true`.
- Para firmar commits ya hechos (locales) se reescribe el historial. Resumen de comandos (PowerShell):

  1) Crear backup: `git branch backup/signing-before`

  2) Establecer la variable del editor para que no abra el editor interactivo:

```powershell
$env:GIT_SEQUENCE_EDITOR = 'true'
```

  3) Reescribir y firmar todos los commits locales:

```powershell
git rebase -i --root --exec "git commit --amend --no-edit -n -S"
```

  4) Verificar firmas: `git log --show-signature -n 10`

  5) Si la rama ya estaba en remoto, fuerza push con precaución:

```powershell
git push --force-with-lease origin your-branch-name
```

## Notas y recomendaciones

- Si trabajas en Windows y no quieres instalar toolchains nativos, el backend JSON ofrece un flujo de desarrollo rápido. Para producción considera migrar a SQLite/Prisma o a una base de datos gestionada.
- Si reescribes commits para firmarlos y la rama ya se compartió, avisa a colaboradores antes de `--force`.

## Contribuciones

- Si quieres mejorar el proyecto, crea una rama nueva y abre un PR. Para cambios grandes (migración a SQLite, subir assets vía multipart, optimizaciones) hablemos antes para coordinar.

## Licencia

- MIT  usa y adapta a gusto.

---

Si quieres que amplíe la documentación (por ejemplo: ejemplo de payloads de la API, limitaciones de imágenes, o instrucciones para desplegar en Vercel), dime qué sección quieres que extienda y la añado.
