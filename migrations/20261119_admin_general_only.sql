USE SistemaServicioSocial;

-- Las ofertas fuera del flujo de aprobacion quedan archivadas como finalizadas.
UPDATE ofertas
SET activo = 0
WHERE estado_aprobacion <> 'APROBADA';

-- La identidad de quien creo una oferta sigue apuntando al administrador general.
UPDATE ofertas SET decidido_por = NULL WHERE decidido_por IS NOT NULL;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS solicitudes_externas;
DROP TABLE IF EXISTS auditoria_ofertas;

ALTER TABLE ofertas
  DROP FOREIGN KEY fk_oferta_decisor,
  DROP FOREIGN KEY fk_oferta_facultad,
  DROP FOREIGN KEY fk_oferta_version,
  DROP COLUMN estado_aprobacion,
  DROP COLUMN id_facultad_destino,
  DROP COLUMN id_oferta_version_anterior,
  DROP COLUMN decision_comentario,
  DROP COLUMN decidido_por,
  DROP COLUMN decidido_en;

DELETE FROM usuarios WHERE rol <> 'admin';

ALTER TABLE usuarios
  DROP FOREIGN KEY fk_usuarios_facultad,
  DROP COLUMN id_facultad,
  MODIFY rol ENUM('admin') NOT NULL DEFAULT 'admin';
