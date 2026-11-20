-- Agrega el catálogo oficial de programas y configura sus planes académicos.
-- Ejecutar una vez sobre SistemaServicioSocial después de la migración institucional.
USE SistemaServicioSocial;

ALTER TABLE carreras
  ADD COLUMN total_materias_plan INT NULL AFTER codigo_carrera;

UPDATE facultades
SET nombre_facultad = CASE id_facultad
  WHEN 1 THEN 'Facultad de Ciencias Jurídicas'
  WHEN 2 THEN 'Facultad de Economía y Ciencias Sociales'
  WHEN 3 THEN 'Facultad de Ingeniería y Ciencias Naturales'
  WHEN 4 THEN 'Facultad de Ciencias de la Salud'
  WHEN 5 THEN 'Escuela en Educación'
  ELSE nombre_facultad
END
WHERE id_facultad > 0 AND id_facultad BETWEEN 1 AND 5;

UPDATE carreras
SET total_materias_plan = CASE nombre_carrera
  WHEN 'Licenciatura en Ciencias Jurídicas' THEN 52
  WHEN 'Ingeniería en Sistemas Computacionales' THEN 52
  WHEN 'Ingeniería Industrial' THEN 52
  WHEN 'Ingeniería en Agronegocios' THEN 52
  WHEN 'Ingeniería Eléctrica' THEN 52
  WHEN 'Técnico en Logística y Aduanas' THEN 22
  WHEN 'Técnico Superior en Ciencia de Datos' THEN 20
  WHEN 'Licenciatura en Administración de Empresas' THEN 52
  WHEN 'Licenciatura en Contaduría Pública' THEN 52
  WHEN 'Licenciatura en Mercadeo' THEN 52
  WHEN 'Licenciatura en Trabajo Social' THEN 43
  WHEN 'Licenciatura en Matemática' THEN 52
  WHEN 'Licenciatura en Ciencias Naturales' THEN 52
  WHEN 'Licenciatura en Lenguaje y Literatura' THEN 52
  WHEN 'Licenciatura en Educación Física, Deportes y Recreación' THEN 52
  WHEN 'Licenciatura en Psicología' THEN 52
  WHEN 'Técnico en Enfermería' THEN 17
  WHEN 'Licenciatura en Enfermería' THEN 42
  WHEN 'Maestría en Neuropsicología del Aprendizaje' THEN 20
  WHEN 'Maestría en Atención Integral de la Primera Infancia' THEN 18
  WHEN 'Maestría en Innovación Educativa' THEN 16
  WHEN 'Maestría en Gerencia de Proyectos' THEN 18
  WHEN 'Maestría en Administración y Gestión Educativa' THEN 18
  ELSE total_materias_plan
END
WHERE id_carrera > 0;

INSERT INTO carreras (nombre_carrera, codigo_carrera, id_facultad, total_materias_plan)
SELECT catalogo.nombre_carrera, NULL, catalogo.id_facultad, catalogo.total_materias_plan
FROM (
  SELECT 'Técnico en Logística y Aduanas' AS nombre_carrera, 3 AS id_facultad, 22 AS total_materias_plan UNION ALL
  SELECT 'Técnico Superior en Ciencia de Datos', 3, 20 UNION ALL
  SELECT 'Licenciatura en Trabajo Social', 2, 43 UNION ALL
  SELECT 'Técnico en Enfermería', 4, 17 UNION ALL
  SELECT 'Licenciatura en Enfermería', 4, 42 UNION ALL
  SELECT 'Maestría en Neuropsicología del Aprendizaje', NULL, 20 UNION ALL
  SELECT 'Maestría en Atención Integral de la Primera Infancia', NULL, 18 UNION ALL
  SELECT 'Maestría en Innovación Educativa', NULL, 16 UNION ALL
  SELECT 'Maestría en Gerencia de Proyectos', NULL, 18 UNION ALL
  SELECT 'Maestría en Administración y Gestión Educativa', NULL, 18
) AS catalogo
LEFT JOIN carreras existente ON existente.nombre_carrera = catalogo.nombre_carrera
WHERE existente.id_carrera IS NULL;

UPDATE estudiantes e
JOIN carreras c ON c.id_carrera = e.id_carrera
SET e.total_materias_plan = c.total_materias_plan
WHERE e.id_estudiante > 0 AND e.total_materias_plan IS NULL AND c.total_materias_plan IS NOT NULL;

ALTER TABLE reglas_academicas
  MODIFY minimo_materias_porcentaje DECIMAL(5,2) NULL;

UPDATE reglas_academicas r
JOIN carreras c ON c.id_carrera = r.id_carrera
SET r.minimo_materias_porcentaje = CASE
  WHEN c.nombre_carrera = 'Licenciatura en Psicología' THEN 50
  WHEN c.nombre_carrera LIKE 'Maestría en %' THEN NULL
  ELSE 20
END
WHERE r.id_regla > 0;

INSERT INTO reglas_academicas (id_carrera, minimo_materias_porcentaje, horas_sociales_requeridas, horas_ambientales_requeridas)
SELECT c.id_carrera,
       CASE WHEN c.nombre_carrera LIKE 'Maestría en %' THEN NULL ELSE 20 END,
       CASE WHEN c.nombre_carrera LIKE 'Técnico%' THEN 15 ELSE 25 END,
       25
FROM carreras c
LEFT JOIN reglas_academicas r ON r.id_carrera = c.id_carrera
WHERE r.id_regla IS NULL;
