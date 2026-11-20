-- Ejecutar una sola vez en bases existentes.
ALTER TABLE usuarios
  ADD COLUMN numero_expediente VARCHAR(20) NULL,
  ADD UNIQUE KEY uq_usuarios_numero_expediente (numero_expediente);

-- Asigna expedientes únicos a todos los estudiantes existentes y conserva el 26340 de Jorge.
-- Los administradores no reciben expediente estudiantil.
UPDATE usuarios
SET numero_expediente = CASE
  WHEN id_usuario = 34 THEN '26340'
  WHEN id_usuario < 34 THEN CAST(26339 + id_usuario AS CHAR)
  ELSE CAST(26338 + id_usuario AS CHAR)
END
WHERE rol = 'estudiante';
