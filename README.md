# SSE.USO — Sistema de Servicio Social Estudiantil

Aplicación web para administrar ofertas de servicio social, estudiantes, inscripciones, acreditación de horas y constancias.

## Tecnologías

- Frontend: React 19 y Vite 8
- Backend: Node.js, Express 5 y mysql2
- Base de datos: MySQL 8

## Requisitos

- Node.js 22 LTS recomendado (Node 20.19 o posterior también funciona con Vite 8).
- npm incluido con Node.js.
- MySQL 8 en ejecución.

## Preparación de la base de datos

`database.sql` es una copia del esquema y los datos que usa actualmente el proyecto. Incluye carreras, facultades, reglas académicas, estudiantes, ofertas, inscripciones, horas manuales y la cuenta de administrador.

> **Importante:** importar `database.sql` elimina y vuelve a crear `SistemaServicioSocial`. Úsalo para una instalación nueva o después de respaldar cualquier base que quieras conservar.

En Windows, desde la raíz del proyecto:

```powershell
mysql -u root -p -e "source database.sql"
```

También puedes abrir `database.sql` en MySQL Workbench y ejecutarlo. La cuenta de MySQL indicada (`root`) es solo un ejemplo; usa la que configuraste en tu equipo.

## Configurar y arrancar el backend

Desde una terminal PowerShell:

```powershell
Copy-Item Backend/.env.example Backend/.env
```

Edita `Backend/.env` y coloca las credenciales locales de MySQL y un secreto JWT propio. Luego instala dependencias e inicia el servidor:

```powershell
cd Backend
npm ci
npm run dev
```

El backend escucha en `http://localhost:4000`. Puedes comprobar que está activo en `http://localhost:4000/api/health`.

## Configurar y arrancar el frontend

Abre otra terminal PowerShell desde la raíz del proyecto:

```powershell
cd Frontend
npm ci
npm run dev
```

Abre la dirección que muestre Vite, normalmente `http://localhost:5173`.

## Acceso incluido en la copia de la base

- Correo: `admin@usonsonate.edu.sv`
- Contraseña de demostración: `2323`

La base exportada contiene datos académicos de estudiantes (incluidos nombres, expedientes y correos) y la cuenta administrativa actual. Compártela únicamente con las personas autorizadas para acceder a esos datos. El hash de contraseña se incluye en `database.sql`; no se incluyen secretos de `Backend/.env`.

## Imágenes de ofertas

Las imágenes se guardan en `Backend/uploads/ofertas/` y están incluidas en el proyecto. Conserva esa carpeta para que las ofertas de la base exportada puedan mostrar sus imágenes.

## Base existente y migraciones

Para instalar en una base nueva, importa `database.sql`; no hace falta ejecutar los archivos de `migrations/` después. Esos archivos documentan cambios para bases creadas con versiones anteriores y deben aplicarse solo si se está actualizando una instalación antigua. Haz una copia de seguridad antes de migrar.

## Notas

- No compartas `Backend/.env`; contiene credenciales y secretos locales. El archivo `Backend/.env.example` sirve como plantilla.
- No subas `node_modules/`, archivos `.env` ni compilaciones `dist/` al repositorio.
- Inicia el backend antes de iniciar sesión o cargar información desde el frontend.
