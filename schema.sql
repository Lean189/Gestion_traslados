-- Esquema inicial para Gestión de Traslados

-- 1. Tabla de Sectores (Pisos, Guardias, Imágenes, etc.)
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Tipos de Traslado (Camilla, Silla de Ruedas, Autónomo)
CREATE TABLE IF NOT EXISTS transfer_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Traslados (La tabla principal)
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_history_number TEXT, -- Opcional: DNI o HC
  origin_sector_id UUID REFERENCES sectors(id),
  destination_sector_id UUID REFERENCES sectors(id),
  transfer_type_id UUID REFERENCES transfer_types(id),
  priority TEXT CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')) DEFAULT 'MEDIA',
  status TEXT CHECK (status IN ('PENDIENTE', 'EN_ADJUDICACION', 'EN_CURSO', 'COMPLETADO', 'CANCELADO')) DEFAULT 'PENDIENTE',
  requester_id UUID, -- Referencia a quien pidió el traslado
  transporter_id UUID, -- Referencia al camillero asignado
  observation TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Insertar datos iniciales de prueba
INSERT INTO sectors (name) VALUES 
('Guardia'), 
('Piso 1'), 
('Piso 2'), 
('UTI'), 
('Imágenes (Rayos)'), 
('Imágenes (Resonancia)'),
('Imágenes (Tomografia)')
ON CONFLICT (name) DO NOTHING;

INSERT INTO transfer_types (name) VALUES 
('Camilla'), 
('Silla de Ruedas')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- ==========================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para Sectores (Lectura pública para usuarios anónimos)
CREATE POLICY "Lectura pública de sectores" 
ON sectors FOR SELECT 
TO anon 
USING (true);

-- 3. Políticas para Tipos de Traslado (Lectura pública para usuarios anónimos)
CREATE POLICY "Lectura pública de tipos" 
ON transfer_types FOR SELECT 
TO anon 
USING (true);

-- 4. Políticas para Traslados (Acceso completo para la demo)
-- NOTA: En un entorno real, esto se restringiría por autenticación (auth.uid())
CREATE POLICY "Acceso público a traslados" 
ON transfers FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
