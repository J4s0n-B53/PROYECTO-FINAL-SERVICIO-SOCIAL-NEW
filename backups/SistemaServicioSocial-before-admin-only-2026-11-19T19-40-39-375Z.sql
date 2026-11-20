SET FOREIGN_KEY_CHECKS=0;
CREATE DATABASE IF NOT EXISTS `SistemaServicioSocial`;
USE `SistemaServicioSocial`;
DROP TABLE IF EXISTS `auditoria_ofertas`;
CREATE TABLE `auditoria_ofertas` (
  `id_auditoria` bigint NOT NULL AUTO_INCREMENT,
  `id_oferta` int NOT NULL,
  `id_usuario` int NOT NULL,
  `accion` enum('CREADA','EDITADA','APROBADA','RECHAZADA','REENVIADA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_anterior` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_oferta` (`id_oferta`,`creado_en`),
  KEY `fk_auditoria_usuario` (`id_usuario`),
  CONSTRAINT `fk_auditoria_oferta` FOREIGN KEY (`id_oferta`) REFERENCES `ofertas` (`id_oferta`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `carreras`;
CREATE TABLE `carreras` (
  `id_carrera` int NOT NULL AUTO_INCREMENT,
  `nombre_carrera` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_carrera` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_materias_plan` int DEFAULT NULL,
  `id_facultad` int DEFAULT NULL,
  PRIMARY KEY (`id_carrera`),
  UNIQUE KEY `uq_carreras_codigo` (`codigo_carrera`),
  KEY `id_facultad` (`id_facultad`),
  CONSTRAINT `carreras_ibfk_1` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `estudiantes`;
CREATE TABLE `estudiantes` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_institucional` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_expediente` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `materias_aprobadas` int NOT NULL DEFAULT '0',
  `total_materias_plan` int DEFAULT NULL,
  `id_carrera` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `horas_manuales` int NOT NULL DEFAULT '0',
  `fecha_horas_manuales` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `uq_estudiantes_expediente` (`numero_expediente`),
  KEY `idx_estudiantes_carrera` (`id_carrera`),
  CONSTRAINT `fk_estudiantes_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `facultades`;
CREATE TABLE `facultades` (
  `id_facultad` int NOT NULL AUTO_INCREMENT,
  `nombre_facultad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_facultad`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `horas_manuales_acreditadas`;
CREATE TABLE `horas_manuales_acreditadas` (
  `id_hora_manual` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `horas` int NOT NULL,
  `descripcion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Acreditacion manual',
  `fecha_acreditacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_hora_manual`),
  KEY `id_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_horas_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `inscripciones`;
CREATE TABLE `inscripciones` (
  `id_inscripcion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_oferta` int NOT NULL,
  `fecha_inscripcion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','aceptado','finalizado','rechazado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `horas_acreditadas` int DEFAULT NULL,
  `fecha_acreditacion` timestamp NULL DEFAULT NULL,
  `id_usuario_inscribe` int DEFAULT NULL,
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `id_estudiante` (`id_estudiante`,`id_oferta`),
  KEY `id_oferta` (`id_oferta`),
  KEY `fk_inscripciones_usuario_inscribe` (`id_usuario_inscribe`),
  CONSTRAINT `fk_inscripciones_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`),
  CONSTRAINT `fk_inscripciones_usuario_inscribe` FOREIGN KEY (`id_usuario_inscribe`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`id_oferta`) REFERENCES `ofertas` (`id_oferta`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id_notificacion` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_notificacion_usuario` (`id_usuario`,`leida`,`creado_en`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `ofertas`;
CREATE TABLE `ofertas` (
  `id_oferta` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horas_acreditar` int NOT NULL,
  `es_ambiental` tinyint(1) DEFAULT '0',
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cupo_maximo` int NOT NULL,
  `cupo_actual` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `id_carrera` int DEFAULT NULL,
  `id_admin_creador` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `institucion_receptora` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modalidad` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_aprobacion` enum('PENDIENTE_APROBACION','APROBADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'APROBADA',
  `id_facultad_destino` int DEFAULT NULL,
  `id_oferta_version_anterior` int DEFAULT NULL,
  `decision_comentario` text COLLATE utf8mb4_unicode_ci,
  `decidido_por` int DEFAULT NULL,
  `decidido_en` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_oferta`),
  KEY `id_carrera` (`id_carrera`),
  KEY `id_admin_creador` (`id_admin_creador`),
  KEY `fk_oferta_facultad` (`id_facultad_destino`),
  KEY `fk_oferta_version` (`id_oferta_version_anterior`),
  KEY `fk_oferta_decisor` (`decidido_por`),
  CONSTRAINT `fk_oferta_decisor` FOREIGN KEY (`decidido_por`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_oferta_facultad` FOREIGN KEY (`id_facultad_destino`) REFERENCES `facultades` (`id_facultad`),
  CONSTRAINT `fk_oferta_version` FOREIGN KEY (`id_oferta_version_anterior`) REFERENCES `ofertas` (`id_oferta`),
  CONSTRAINT `ofertas_ibfk_1` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`),
  CONSTRAINT `ofertas_ibfk_2` FOREIGN KEY (`id_admin_creador`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `reglas_academicas`;
CREATE TABLE `reglas_academicas` (
  `id_regla` int NOT NULL AUTO_INCREMENT,
  `id_carrera` int DEFAULT NULL,
  `minimo_materias_porcentaje` decimal(5,2) DEFAULT NULL,
  `horas_sociales_requeridas` int NOT NULL,
  `horas_ambientales_requeridas` int NOT NULL DEFAULT '25',
  PRIMARY KEY (`id_regla`),
  UNIQUE KEY `uq_regla_carrera` (`id_carrera`),
  CONSTRAINT `fk_regla_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `solicitudes_externas`;
CREATE TABLE `solicitudes_externas` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_facultad` int NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_pdf` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('PENDIENTE_DECANO','PENDIENTE_PROYECCION_SOCIAL','APROBADA','RECHAZADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE_DECANO',
  `comentario_decano` text COLLATE utf8mb4_unicode_ci,
  `comentario_proyeccion_social` text COLLATE utf8mb4_unicode_ci,
  `revisado_decano_por` int DEFAULT NULL,
  `revisado_decano_en` timestamp NULL DEFAULT NULL,
  `revisado_proyeccion_por` int DEFAULT NULL,
  `revisado_proyeccion_en` timestamp NULL DEFAULT NULL,
  `creado_por` int NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_solicitud`),
  KEY `fk_solicitud_estudiante` (`id_estudiante`),
  KEY `fk_solicitud_facultad` (`id_facultad`),
  KEY `fk_solicitud_creador` (`creado_por`),
  KEY `fk_solicitud_decano` (`revisado_decano_por`),
  KEY `fk_solicitud_proyeccion` (`revisado_proyeccion_por`),
  CONSTRAINT `fk_solicitud_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_solicitud_decano` FOREIGN KEY (`revisado_decano_por`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_solicitud_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`),
  CONSTRAINT `fk_solicitud_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`),
  CONSTRAINT `fk_solicitud_proyeccion` FOREIGN KEY (`revisado_proyeccion_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo_institucional` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_expediente` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` enum('admin','proyeccion_social','decano') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'proyeccion_social',
  `materias_aprobadas` int DEFAULT '0',
  `id_carrera` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `horas_manuales` int DEFAULT '0',
  `fecha_horas_manuales` timestamp NULL DEFAULT NULL,
  `id_facultad` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo_institucional` (`correo_institucional`),
  UNIQUE KEY `uq_usuarios_numero_expediente` (`numero_expediente`),
  KEY `id_carrera` (`id_carrera`),
  KEY `fk_usuarios_facultad` (`id_facultad`),
  CONSTRAINT `fk_usuarios_facultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id_facultad`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `auditoria_ofertas` (`id_auditoria`, `id_oferta`, `id_usuario`, `accion`, `estado_anterior`, `estado_nuevo`, `comentario`, `creado_en`) VALUES (1, 17, 1, 'CREADA', NULL, 'PENDIENTE_APROBACION', NULL, '2026-11-19 12:36:00.000');
INSERT INTO `auditoria_ofertas` (`id_auditoria`, `id_oferta`, `id_usuario`, `accion`, `estado_anterior`, `estado_nuevo`, `comentario`, `creado_en`) VALUES (2, 17, 68, 'APROBADA', 'PENDIENTE_APROBACION', 'APROBADA', NULL, '2026-11-19 12:41:15.000');
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (1, 'Licenciatura en Ciencias Jurídicas', 'D01', 52, 1);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (2, 'Licenciatura en Administración de Empresas', 'E01', 52, 2);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (3, 'Licenciatura en Mercadeo', 'E02', 52, 2);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (4, 'Licenciatura en Contaduría Pública', 'E03', 52, 2);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (5, 'Ingeniería Eléctrica', 'I01', 52, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (6, 'Ingeniería Industrial', 'I03', 52, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (7, 'Ingeniería en Sistemas Computacionales', 'I04', 52, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (8, 'Ingeniería en Agronegocios', 'I08', 52, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (9, 'Licenciatura en Psicología', 'E17', 52, 4);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (10, 'Licenciatura en Matemática', 'E07', 52, 5);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (11, 'Licenciatura en Ciencias Naturales', 'E06', 52, 5);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (12, 'Licenciatura en Lenguaje y Literatura', 'E14', 52, 5);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (13, 'Licenciatura en Educación Física, Deportes y Recreación', 'E18', 52, 5);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (14, 'Técnico en Logística y Aduanas', NULL, 22, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (15, 'Técnico Superior en Ciencia de Datos', NULL, 20, 3);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (16, 'Licenciatura en Trabajo Social', NULL, 43, 2);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (17, 'Técnico en Enfermería', NULL, 17, 4);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (18, 'Licenciatura en Enfermería', NULL, 42, 4);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (19, 'Maestría en Neuropsicología del Aprendizaje', NULL, 20, NULL);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (20, 'Maestría en Atención Integral de la Primera Infancia', NULL, 18, NULL);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (21, 'Maestría en Innovación Educativa', NULL, 16, NULL);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (22, 'Maestría en Gerencia de Proyectos', NULL, 18, NULL);
INSERT INTO `carreras` (`id_carrera`, `nombre_carrera`, `codigo_carrera`, `total_materias_plan`, `id_facultad`) VALUES (23, 'Maestría en Administración y Gestión Educativa', NULL, 18, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (2, 'Mariana Lisbeth Cortez Aguilar', 'ca26d01001@usonsonate.edu.sv', '26341', 18, 52, 1, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (3, 'Oscar Daniel Perez Rivas', 'pr25d01002@usonsonate.edu.sv', '26342', 27, 52, 1, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (4, 'Rosa Elena Morales Campos', 'mc24d01003@usonsonate.edu.sv', '26343', 32, 52, 1, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (5, 'Nelson Antonio Guardado Mejia', 'gm23d01004@usonsonate.edu.sv', '26344', 38, 52, 1, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (6, 'Valeria Sofia Henriquez Arias', 'ha22d01005@usonsonate.edu.sv', '26345', 45, 52, 1, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (7, 'Kevin Alexander Lopez Benitez', 'lb26e01001@usonsonate.edu.sv', '26346', 18, 52, 2, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (8, 'Claudia Vanessa Batres Serrano', 'bs25e01002@usonsonate.edu.sv', '26347', 27, 52, 2, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (9, 'Jose Armando Rivera Orellana', 'ro24e01003@usonsonate.edu.sv', '26348', 32, 52, 2, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (10, 'Gabriela Elizabeth Coreas Campos', 'cc23e01004@usonsonate.edu.sv', '26349', 38, 52, 2, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (11, 'Ricardo Ernesto Mendoza Chavez', 'mc22e01005@usonsonate.edu.sv', '26350', 45, 52, 2, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (12, 'Adriana Marcela Rodriguez Pineda', 'rp26e02001@usonsonate.edu.sv', '26351', 18, 52, 3, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (13, 'Bryan Esteven Cortez Portillo', 'cp25e02002@usonsonate.edu.sv', '26352', 27, 52, 3, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (14, 'Paola Alejandra Vasquez Molina', 'vm24e02003@usonsonate.edu.sv', '26353', 32, 52, 3, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (15, 'Sofia Carolina Hernandez Flores', 'hf23e02004@usonsonate.edu.sv', '26354', 38, 52, 3, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (16, 'Diego Alejandro Ortiz Zelaya', 'oz22e02005@usonsonate.edu.sv', '26355', 45, 52, 3, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (17, 'Christian Vladimir Juarez Pena', 'jp26e03001@usonsonate.edu.sv', '26356', 18, 52, 4, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (18, 'Carlos Alberto Henriquez Interiano', 'hi25e03002@usonsonate.edu.sv', '26357', 27, 52, 4, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (19, 'Ana Beatriz Salazar Fuentes', 'sf24e03003@usonsonate.edu.sv', '26358', 32, 52, 4, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (20, 'Luis Fernando Martinez Escobar', 'me23e03004@usonsonate.edu.sv', '26359', 38, 52, 4, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (21, 'Karla Patricia Gomez Quintanilla', 'gq22e03005@usonsonate.edu.sv', '26360', 45, 52, 4, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (22, 'Fernando Jose Molina Guardado', 'mg26i01001@usonsonate.edu.sv', '26361', 18, 52, 5, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (23, 'Roberto Carlos Ayala Navas', 'an25i01002@usonsonate.edu.sv', '26362', 27, 52, 5, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (24, 'Elmer Antonio Cruz Lemus', 'cl24i01003@usonsonate.edu.sv', '26363', 32, 52, 5, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (25, 'Daniel Ernesto Pineda Romero', 'pr23i01004@usonsonate.edu.sv', '26364', 38, 52, 5, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (26, 'Cecilia Maria Amaya Duarte', 'ad22i01005@usonsonate.edu.sv', '26365', 45, 52, 5, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (27, 'Miguel Angel Rivas Calderon', 'rc26i03001@usonsonate.edu.sv', '26366', 18, 52, 6, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (28, 'Alfredo Benjamin Torres Luna', 'tl25i03002@usonsonate.edu.sv', '26367', 27, 52, 6, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (29, 'Susana Beatriz Mejia Alvarado', 'ma24i03003@usonsonate.edu.sv', '26368', 32, 52, 6, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (30, 'Hector Mauricio Diaz Ventura', 'dv23i03004@usonsonate.edu.sv', '26369', 38, 52, 6, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (31, 'Lorena Abigail Castillo Reyes', 'cr22i03005@usonsonate.edu.sv', '26370', 45, 52, 6, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (32, 'Brayan Francisco Sion Dimas', 'sd26i04001@usonsonate.edu.sv', '26371', 18, 52, 7, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (33, 'Jason Ernesto Benitez Lopez', 'bl25i04002@usonsonate.edu.sv', '26372', 27, 52, 7, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (34, 'Jorge Reinaldo Colocho Ayala', 'ca24i04003@usonsonate.edu.sv', '26340', 32, 52, 7, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (35, 'Leonardo Antonio Saz Diaz', 'sd23i04004@usonsonate.edu.sv', '26373', 38, 52, 7, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (36, 'Daniela Alexandra Martinez Lemus', 'ml22i04005@usonsonate.edu.sv', '26374', 45, 52, 7, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (37, 'Andrea Beatriz Morales Rivas', 'mr26i08001@usonsonate.edu.sv', '26375', 18, 52, 8, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (38, 'Gisselle Alejandra Pena Duran', 'pd25i08002@usonsonate.edu.sv', '26376', 27, 52, 8, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (39, 'Oscar Daniel Aguilar Perez', 'ap24i08003@usonsonate.edu.sv', '26377', 32, 52, 8, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (40, 'Ruth Carolina Escobar Bonilla', 'eb23i08004@usonsonate.edu.sv', '26378', 38, 52, 8, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (41, 'Mauricio Ernesto Recinos Flores', 'rf22i08005@usonsonate.edu.sv', '26379', 45, 52, 8, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (42, 'Gabriela Maria Fuentes Amaya', 'fa26e17001@usonsonate.edu.sv', '26380', 18, 52, 9, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (43, 'Sofia Fernanda Tulipan Gallardo', 'tg25e17002@usonsonate.edu.sv', '26381', 27, 52, 9, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (44, 'Marvin Josue Castaneda Lemus', 'cl24e17003@usonsonate.edu.sv', '26382', 32, 52, 9, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (45, 'Elena Patricia Barrera Nunez', 'bn23e17004@usonsonate.edu.sv', '26383', 38, 52, 9, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (46, 'Samuel Alejandro Portillo Gomez', 'pg22e17005@usonsonate.edu.sv', '26384', 45, 52, 9, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (47, 'Iris Alejandra Funes Rivas', 'fr26e07001@usonsonate.edu.sv', '26385', 18, 52, 10, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (48, 'Manuel Antonio Solis Campos', 'sc25e07002@usonsonate.edu.sv', '26386', 27, 52, 10, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (49, 'Rebeca Elizabeth Castro Pena', 'cp24e07003@usonsonate.edu.sv', '26387', 32, 52, 10, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (50, 'Victor Hugo Mejia Andrade', 'ma23e07004@usonsonate.edu.sv', '26388', 38, 52, 10, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (51, 'Flor Maria Reyes Ochoa', 'ro22e07005@usonsonate.edu.sv', '26389', 45, 52, 10, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (52, 'Julio Cesar Menjivar Alfaro', 'ma26e06001@usonsonate.edu.sv', '26390', 18, 52, 11, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (53, 'Natalia Abigail Cortez Figueroa', 'cf25e06002@usonsonate.edu.sv', '26391', 27, 52, 11, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (54, 'Erick Orlando Chavez Rivera', 'cr24e06003@usonsonate.edu.sv', '26392', 32, 52, 11, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (55, 'Marcela Vanessa Aquino Flores', 'af23e06004@usonsonate.edu.sv', '26393', 38, 52, 11, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (56, 'Rafael Enrique Melendez Santos', 'ms22e06005@usonsonate.edu.sv', '26394', 45, 52, 11, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (57, 'Diana Carolina Barahona Vega', 'bv26e14001@usonsonate.edu.sv', '26395', 18, 52, 12, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (58, 'Francisco Javier Lara Molina', 'lm25e14002@usonsonate.edu.sv', '26396', 27, 52, 12, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (59, 'Silvia Beatriz Campos Orellana', 'co24e14003@usonsonate.edu.sv', '26397', 32, 52, 12, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (60, 'Jonathan Alexander Merino Cruz', 'mc23e14004@usonsonate.edu.sv', '26398', 38, 52, 12, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (61, 'Patricia Lisseth Navas Romero', 'nr22e14005@usonsonate.edu.sv', '26399', 45, 52, 12, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (62, 'Alexander Mauricio Franco Salinas', 'fs26e18001@usonsonate.edu.sv', '26400', 18, 52, 13, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (63, 'Carolina Estefania Pineda Guzman', 'pg25e18002@usonsonate.edu.sv', '26401', 27, 52, 13, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (64, 'Edwin Alberto Sorto Lopez', 'sl24e18003@usonsonate.edu.sv', '26402', 32, 52, 13, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (65, 'Yesenia Maribel Quintanilla Rivas', 'qr23e18004@usonsonate.edu.sv', '26403', 38, 52, 13, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (66, 'Jose David Hernandez Cabrera', 'hc22e18005@usonsonate.edu.sv', '26404', 45, 52, 13, '2026-05-28 09:00:00.000', 0, NULL);
INSERT INTO `estudiantes` (`id_estudiante`, `nombre_completo`, `correo_institucional`, `numero_expediente`, `materias_aprobadas`, `total_materias_plan`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`) VALUES (67, 'Ayleen Sucely Gonzales Rivera', 'gr23i04006@usonsonate.edu.sv', '26405', 35, 52, 7, '2026-06-02 19:16:23.000', 375, '2026-06-03 11:47:45.000');
INSERT INTO `facultades` (`id_facultad`, `nombre_facultad`, `created_at`) VALUES (1, 'Facultad de Ciencias Jurídicas', '2026-05-05 18:53:26.000');
INSERT INTO `facultades` (`id_facultad`, `nombre_facultad`, `created_at`) VALUES (2, 'Facultad de Economía y Ciencias Sociales', '2026-05-05 18:53:26.000');
INSERT INTO `facultades` (`id_facultad`, `nombre_facultad`, `created_at`) VALUES (3, 'Facultad de Ingeniería y Ciencias Naturales', '2026-05-05 18:53:26.000');
INSERT INTO `facultades` (`id_facultad`, `nombre_facultad`, `created_at`) VALUES (4, 'Facultad de Ciencias de la Salud', '2026-05-05 18:53:26.000');
INSERT INTO `facultades` (`id_facultad`, `nombre_facultad`, `created_at`) VALUES (5, 'Escuela en Educación', '2026-05-05 18:53:26.000');
INSERT INTO `horas_manuales_acreditadas` (`id_hora_manual`, `id_estudiante`, `horas`, `descripcion`, `fecha_acreditacion`) VALUES (1, 67, 75, 'Acreditacion manual', '2026-06-03 11:46:15.000');
INSERT INTO `horas_manuales_acreditadas` (`id_hora_manual`, `id_estudiante`, `horas`, `descripcion`, `fecha_acreditacion`) VALUES (2, 67, 150, 'Acreditacion manual', '2026-06-03 11:47:19.000');
INSERT INTO `horas_manuales_acreditadas` (`id_hora_manual`, `id_estudiante`, `horas`, `descripcion`, `fecha_acreditacion`) VALUES (3, 67, 50, 'Acreditacion manual', '2026-06-03 11:47:31.000');
INSERT INTO `horas_manuales_acreditadas` (`id_hora_manual`, `id_estudiante`, `horas`, `descripcion`, `fecha_acreditacion`) VALUES (4, 67, 100, 'Acreditacion manual', '2026-06-03 11:47:45.000');
INSERT INTO `inscripciones` (`id_inscripcion`, `id_estudiante`, `id_oferta`, `fecha_inscripcion`, `estado`, `horas_acreditadas`, `fecha_acreditacion`, `id_usuario_inscribe`) VALUES (3, 67, 7, '2026-06-03 11:44:12.000', 'finalizado', 100, '2026-06-03 11:45:45.000', NULL);
INSERT INTO `inscripciones` (`id_inscripcion`, `id_estudiante`, `id_oferta`, `fecha_inscripcion`, `estado`, `horas_acreditadas`, `fecha_acreditacion`, `id_usuario_inscribe`) VALUES (4, 67, 14, '2026-06-03 11:44:16.000', 'finalizado', 25, '2026-06-03 11:45:12.000', NULL);
INSERT INTO `notificaciones` (`id_notificacion`, `id_usuario`, `titulo`, `mensaje`, `leida`, `creado_en`) VALUES (1, 68, 'Nueva oferta pendiente de revisión', 'La oferta \"fsddsdsgdgddfsfdsfdfsd\" está pendiente de aprobación.', 0, '2026-11-19 12:36:00.000');
INSERT INTO `notificaciones` (`id_notificacion`, `id_usuario`, `titulo`, `mensaje`, `leida`, `creado_en`) VALUES (2, 1, 'Oferta aprobada', 'La oferta \"fsddsdsgdgddfsfdsfdfsd\" fue aprobada.', 0, '2026-11-19 12:41:15.000');
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (1, 'Asesoria Legal Comunitaria', 'Apoyo en jornadas de orientacion legal basica para habitantes de comunidades cercanas, con registro de consultas y acompanamiento en procesos administrativos.', 'Consultorio Juridico USO', NULL, 80, 0, '/uploads/ofertas/1780366195849-486000171.png', 8, 0, 1, 1, 1, '2026-05-28 11:56:51.000', '2026-06-08 00:00:00.000', '2026-06-19 00:00:00.000', '08:00:00', '12:00:00', NULL, NULL, 'APROBADA', 1, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (2, 'Apoyo Administrativo Institucional', 'Colaboracion en organizacion de expedientes, atencion al usuario, control de documentos y mejora de procesos administrativos en oficinas universitarias.', 'Administracion Academica', NULL, 80, 0, 'https://www.quecursar.com/wp-content/uploads/2026/02/auxiliar-administrativo-un-puesto-para-dar-apoyo-a-toda-la-empresa.jpg', 10, 0, 1, 2, 1, '2026-05-28 11:56:51.000', '2026-06-08 00:00:00.000', '2026-06-19 00:00:00.000', '08:30:00', '12:30:00', NULL, NULL, 'APROBADA', 2, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (3, 'Campaña de Comunicación Social', 'Diseno y apoyo en una campana informativa para promover actividades universitarias y proyectos comunitarios mediante materiales digitales y encuestas.', 'Unidad de Comunicaciones', NULL, 60, 0, 'https://www.pedagogica.edu.sv/wp-content/uploads/2021/01/licenciatura-en-mercadeo.jpg', 10, 0, 0, 3, 1, '2026-05-28 11:56:51.000', '2026-06-10 00:00:00.000', '2026-06-24 00:00:00.000', '09:00:00', '12:00:00', NULL, NULL, 'APROBADA', 2, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (4, 'Educación Financiera Comunitaria', 'Apoyo en talleres de presupuesto familiar, registro contable basico y orientacion sobre control de ingresos y gastos para pequenos emprendimientos.', 'Centro de Proyeccion Social', NULL, 70, 0, 'https://edufinanciera.ssf.gob.sv/wp-content/uploads/2025/02/financiera-1024x672.png', 8, 0, 1, 4, 1, '2026-05-28 11:56:51.000', '2026-06-09 00:00:00.000', '2026-06-23 00:00:00.000', '08:00:00', '11:30:00', NULL, NULL, 'APROBADA', 2, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (5, 'Mantenimiento Electrico Preventivo', 'Revision de luminarias, apoyo en diagnostico de instalaciones electricas y elaboracion de reportes de mantenimiento preventivo en espacios academicos.', 'Campus Central', NULL, 80, 0, 'https://montegar.es/wp-content/uploads/2024/12/mantenimiento-preventivo.jpg', 6, 0, 1, 5, 1, '2026-05-28 11:56:51.000', '2026-06-08 00:00:00.000', '2026-06-19 00:00:00.000', '08:00:00', '12:00:00', NULL, NULL, 'APROBADA', 3, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (6, 'Mejora de Procesos Institucionales', 'Levantamiento de procesos, identificacion de tiempos de espera y propuesta de mejoras para optimizar la atencion en unidades administrativas.', 'Oficinas Administrativas USO', NULL, 90, 0, 'https://etransresol.com/images/eventos/ingenieria-industrial-optimizacion-de-procesos-y-mejora-continua-aseguramiento-de-la-calidad-y-control-de-la-produccion-etransresol-blog.jpg', 8, 0, 1, 6, 1, '2026-05-28 11:56:51.000', '2026-06-11 00:00:00.000', '2026-06-26 00:00:00.000', '08:00:00', '12:00:00', NULL, NULL, 'APROBADA', 3, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (7, 'Soporte Técnico ', 'Apoyo en mantenimiento basico de equipos.', 'Universidad de Sonsonate, Edificio A, Aula 23.', NULL, 100, 0, 'https://emprending.com.ar/wp-content/uploads/2022/02/reparar-pc-01.jpg', 2, 1, 1, 7, 1, '2026-05-28 11:56:51.000', '2026-06-01 00:00:00.000', '2026-06-05 00:00:00.000', '08:00:00', '12:00:00', NULL, NULL, 'APROBADA', 3, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (8, 'Jornada Ambiental ', 'Participacion en limpieza de areas verdes, clasificacion de residuos, preparacion de compostaje.', 'CITAM', NULL, 25, 0, 'https://uiyps-uso.com/wp-content/uploads/2025/09/Imagen-de-WhatsApp-2025-09-19-a-las-16.12.37_dfbd7438.jpg', 10, 0, 1, 8, 1, '2026-05-28 11:56:51.000', '2026-06-12 00:00:00.000', '2026-06-12 00:00:00.000', '08:00:00', '13:00:00', NULL, NULL, 'APROBADA', 3, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (9, 'Acompañamiento Psicoeducativo', 'Apoyo en talleres de habilidades socioemocionales, aplicacion de dinamicas grupales y registro de asistencia en actividades de bienestar estudiantil.', 'Bienestar Estudiantil', NULL, 70, 0, 'https://un.edu.mx/wp-content/uploads/2023/02/Universidad-del-Norte-Perspectivas-laborales-subtitulo-2.png', 8, 0, 1, 9, 1, '2026-05-28 11:56:51.000', '2026-06-09 00:00:00.000', '2026-06-24 00:00:00.000', '09:00:00', '12:00:00', NULL, NULL, 'APROBADA', 4, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (11, 'Club de Ciencias y Medio Ambiente', 'Apoyo en demostraciones cientificas, preparacion de materiales didacticos y actividades de sensibilizacion sobre el cuidado de recursos naturales.', 'Laboratorio de Ciencias', NULL, 80, 0, 'https://lh3.googleusercontent.com/proxy/qatBy_20_bgeEs_fIpGrFcccV1A3JVvwyneSjGG26g44SXfBu6_LIqpo3nCaxjBz0LVwQdPDByOIrBIOw9bad8NR8XqLkQ', 8, 0, 1, 11, 1, '2026-05-28 11:56:51.000', '2026-06-11 00:00:00.000', '2026-06-26 00:00:00.000', '08:00:00', '12:00:00', NULL, NULL, 'APROBADA', 5, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (12, 'Promocion de Lectura Comunitaria', 'Organizacion de circulos de lectura, apoyo en correccion de textos y dinamicas de expresion oral para jovenes de comunidades cercanas.', 'Biblioteca Universitaria', NULL, 60, 0, 'https://img.freepik.com/vector-gratis/personas-estudiando-aprendiendo-sala_74855-6615.jpg?semt=ais_hybrid&w=740&q=80', 8, 0, 1, 12, 1, '2026-05-28 11:56:51.000', '2026-06-08 00:00:00.000', '2026-06-21 00:00:00.000', '09:00:00', '12:00:00', NULL, NULL, 'APROBADA', 5, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (13, 'Programa de Recreacion y Salud Activa', 'Apoyo en actividades deportivas y recreativas para promover habitos saludables, control de participantes y dinamicas de integracion comunitaria.', 'Cancha Universitaria', NULL, 80, 0, 'https://doihojqqs770p.cloudfront.net/articulos/articulos-29099.jpeg', 10, 0, 1, 13, 1, '2026-05-28 11:56:51.000', '2026-06-13 00:00:00.000', '2026-06-27 00:00:00.000', '07:30:00', '11:30:00', NULL, NULL, 'APROBADA', 5, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (14, 'Jornada de Reforestacion y Limpieza Ambiental', 'Participacion en actividades de reforestacion, limpieza de zonas verdes, separacion de residuos y sensibilizacion ambiental en espacios comunitarios.', 'Parque Ecologico Municipal', NULL, 25, 1, '/uploads/ofertas/1780366010213-678613113.png', 20, 1, 1, NULL, 1, '2026-05-28 11:56:51.000', '2026-06-27 00:00:00.000', '2026-06-27 00:00:00.000', '08:00:00', '13:00:00', NULL, NULL, 'APROBADA', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `ofertas` (`id_oferta`, `titulo`, `descripcion`, `ubicacion`, `horario`, `horas_acreditar`, `es_ambiental`, `imagen_url`, `cupo_maximo`, `cupo_actual`, `activo`, `id_carrera`, `id_admin_creador`, `created_at`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `institucion_receptora`, `modalidad`, `estado_aprobacion`, `id_facultad_destino`, `id_oferta_version_anterior`, `decision_comentario`, `decidido_por`, `decidido_en`) VALUES (17, 'fsddsdsgdgddfsfdsfdfsd', 'sdsdddsdsgd', 'efwefewfe', NULL, 50, 0, NULL, 10, 0, 0, NULL, 1, '2026-11-19 12:36:00.000', '2026-11-19 00:00:00.000', '2026-11-21 00:00:00.000', '12:35:00', '15:38:00', 'efrweeweg', 'Presencial', 'APROBADA', 3, NULL, NULL, 68, '2026-11-19 12:41:15.000');
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (1, 1, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (2, 2, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (3, 3, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (4, 4, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (5, 5, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (6, 6, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (7, 7, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (8, 8, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (9, 9, '50.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (10, 10, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (11, 11, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (12, 12, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (13, 13, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (16, NULL, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (17, 14, '20.00', 15, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (18, 15, '20.00', 15, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (19, 16, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (20, 17, '20.00', 15, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (21, 18, '20.00', 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (22, 19, NULL, 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (23, 20, NULL, 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (24, 21, NULL, 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (25, 22, NULL, 25, 25);
INSERT INTO `reglas_academicas` (`id_regla`, `id_carrera`, `minimo_materias_porcentaje`, `horas_sociales_requeridas`, `horas_ambientales_requeridas`) VALUES (26, 23, NULL, 25, 25);
INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `correo_institucional`, `password_hash`, `numero_expediente`, `rol`, `materias_aprobadas`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`, `id_facultad`) VALUES (1, 'Administrador Académico', 'admin@usonsonate.edu.sv', '$2b$10$O7ZOu13jdI5fydPFhhqVC.om0kDbkN6x.19RoMcm8JKEI1F4pKRmO', NULL, 'admin', 0, NULL, '2026-05-05 18:53:26.000', 0, NULL, NULL);
INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `correo_institucional`, `password_hash`, `numero_expediente`, `rol`, `materias_aprobadas`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`, `id_facultad`) VALUES (68, 'Jason Ernesto Benitez Lopez', 'bl23i04001@usonsonate.edu.sv', '$2b$10$rHZsrsxyeMOrWV6qjj4yy.emOy77K13mGfvThxGI/c8JBdsSjqEie', NULL, 'decano', 0, NULL, '2026-11-19 11:18:53.000', 0, NULL, 3);
INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `correo_institucional`, `password_hash`, `numero_expediente`, `rol`, `materias_aprobadas`, `id_carrera`, `created_at`, `horas_manuales`, `fecha_horas_manuales`, `id_facultad`) VALUES (69, 'Emily Elizabeth Benitez Lopez', 'emilybenitez53@usonsonate.edu.sv', '$2b$10$1yu6REww5kE68VCGWaDZTeJrHXlRfEyVX.aifxEkqCo4QHSHtdz72', NULL, 'proyeccion_social', 0, NULL, '2026-11-19 11:21:22.000', 0, NULL, NULL);
SET FOREIGN_KEY_CHECKS=1;
