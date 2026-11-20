# SSE.USO - Sistema de Servicio Social Estudiantil

Aplicación web para que el administrador general gestione ofertas de servicio social, estudiantes, inscripciones, horas acreditadas y constancias.

## Tecnologías

- Frontend: React y Vite
- Backend: Node.js y Express
- Base de datos: MySQL

## Instalación

1. Con MySQL activo, ejecuta `database.sql` para crear `SistemaServicioSocial` con datos de demostración.
2. Configura `Backend/.env` con la conexión MySQL local y un `JWT_SECRET` propio.
3. Desde `Backend`, instala dependencias y arranca el servidor:

   ```powershell
   npm install
   npm start
   ```

4. Desde `Frontend`, instala dependencias y arranca Vite:

   ```powershell
   npm install
   npm run dev -- --host 127.0.0.1 --port 5174
   ```

Abre `http://localhost:5174/`. El backend responde en `http://localhost:4000`; su endpoint de salud es `/api/health`.

## Acceso de demostración

- Correo: `admin@usonsonate.edu.sv`
- Contraseña: `2323`

El administrador puede registrar estudiantes sin crearles cuentas de acceso. Los estudiantes son datos académicos usados para inscripciones y acreditación de horas.

## Base de datos existente

Respalda primero la base que quieres conservar y luego aplica `migrations/20261119_admin_general_only.sql` sobre `SistemaServicioSocial`. Esta migración deja una sola cuenta administrativa, elimina tablas ajenas al uso actual y convierte las ofertas pendientes o rechazadas en ofertas finalizadas. Conserva estudiantes, ofertas, inscripciones, carreras, reglas académicas y horas acreditadas.

Para una instalación nueva, basta ejecutar `database.sql`; ya incluye el esquema reducido, el catálogo académico y los datos de demostración.

## Ofertas e imágenes

El administrador crea, edita, activa y finaliza ofertas. Las imágenes subidas se guardan en `Backend/uploads/ofertas/`; se pueden usar imágenes de hasta 5 MB. Conserva esa carpeta al mover una instalación que ya tenga imágenes locales.

Las inscripciones requieren expediente y materias aprobadas según el plan de estudios. El sistema permite una sola inscripción activa por estudiante y conserva las reglas de horas sociales y ambientales.

## Notas

- No publiques `Backend/.env` ni la carpeta `node_modules`.
- El backend debe estar activo antes de iniciar sesión o cargar datos.
