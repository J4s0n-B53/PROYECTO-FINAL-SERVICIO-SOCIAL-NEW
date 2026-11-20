USE SistemaServicioSocial;

ALTER TABLE ofertas
  ADD COLUMN deleted_at DATETIME NULL,
  ADD KEY idx_ofertas_deleted_at (deleted_at);
