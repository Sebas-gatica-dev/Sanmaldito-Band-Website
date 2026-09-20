# San Maldito

Sitio oficial y plataforma de escucha autogestionada de **San Maldito**. Es un monolito TypeScript: Next.js sirve la experiencia pública, el panel privado y las APIs; Prisma gestiona una base PostgreSQL.

## Funcionalidad

- Página pública, manifiesto, discografía y novedades.
- Álbumes con cero o más canciones.
- Reproductor, likes y comentarios cuando haya canciones publicadas.
- Panel privado para administrar obras, audios, imágenes, novedades y portada.
- Audios MP3/WAV e imágenes de hasta 250 MB guardados fuera del contenedor.
- El panel vive en `/admin`, no aparece enlazado en ninguna pantalla pública y solicita la clave de administración.

## Desarrollo local

Requisitos: Docker con Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

En PowerShell, reemplazar `cp` por `Copy-Item`. La web abre en `http://localhost:3000` y el panel en `http://localhost:3000/admin`.

Para trabajar sin Docker se necesita Node.js 22 y una instancia PostgreSQL. Definir `DATABASE_URL`, instalar dependencias y ejecutar:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Producción en SgInfra

La integración de producción está en `compose.sgdev.yml` y cumple el contrato de SgInfra:

- no publica puertos del host;
- conecta el servicio web a `sgdev-proxy`;
- conecta Prisma al PostgreSQL central mediante `sgdev-data`;
- se compila con `NEXT_PUBLIC_BASE_PATH=/san-maldito-web`;
- persiste las cargas en el directorio indicado por `SAN_MALDITO_UPLOADS_DIR`;
- aplica migraciones y un seed idempotente antes de arrancar.

Variables privadas que deben vivir únicamente en la VPS:

```env
ADMIN_PASSWORD=clave-unica
AUTH_SECRET=secreto-largo-y-aleatorio
NEXT_PUBLIC_SITE_URL=https://sgdev.com.ar/san-maldito-web
NEXT_PUBLIC_BASE_PATH=/san-maldito-web
SAN_MALDITO_UPLOADS_DIR=/opt/apps/san-maldito-web/storage/uploads
```

La base PostgreSQL y su rol se asignan con `SgInfra/scripts/shared-db-admin.py`; su secreto queda en `/etc/sgdev-infra/secrets/san-maldito-web-database.env` y nunca se versiona.

## Persistencia y copias de seguridad

- Base de datos: PostgreSQL central de SgInfra, base y rol exclusivos del proyecto.
- Archivos: `/opt/apps/san-maldito-web/storage/uploads` en la VPS.
- Esquema: migraciones versionadas en `prisma/migrations`.
- Contenido inicial: `prisma/seed.ts` crea el álbum y los textos base sin crear canciones.

Antes de cambios de infraestructura se debe respaldar la base con `pg_dump` y el directorio de cargas con el mecanismo de backup de SgInfra.

## CI y despliegue centralizado

El workflow `.github/workflows/ci.yml` ejecuta lint, build y validación de
`compose.sgdev.yml`. Después de un push válido a `main`, notifica a `SgInfra`
con el target `san-maldito-web`. Configurar `SGINFRA_DISPATCH_TOKEN` como secret
del repositorio para activar el dispatch.

```bash
cd /opt/sgdev-infra
./scripts/app-deploy.sh san-maldito-web --operation deploy-latest
./scripts/app-healthcheck.sh san-maldito-web --require-public-url
```

La URL pública es `https://sgdev.com.ar/san-maldito-web/`.
