-- =================================================================================
-- FASE 2: SEGURIDAD (Supabase Auth y RLS estricto)
-- Instrucciones: Ejecuta todo este script en el SQL Editor de Supabase
-- =================================================================================

-- 1. Tabla de sesiones activas (vincula el usuario anónimo con su rol)
CREATE TABLE IF NOT EXISTS active_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  sector_id UUID REFERENCES sectors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;


-- Los usuarios solo pueden ver su propia sesión
CREATE POLICY "Lectura de propia sesion" ON active_sessions 
FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden borrar su propia sesión al desloguearse
CREATE POLICY "Borrado de propia sesion" ON active_sessions 
FOR DELETE USING (user_id = auth.uid());


-- 2. Función segura (RPC) para validar el PIN y crear la sesión
-- Se ejecuta como SECURITY DEFINER para saltarse el RLS y poder leer los access_codes
CREATE OR REPLACE FUNCTION login_with_pin(p_role TEXT, p_pin TEXT, p_sector_id UUID DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_valid boolean := false;
BEGIN
  -- Verificar PIN
  IF p_role = 'sector' THEN
    -- Try specific sector code
    SELECT EXISTS (
      SELECT 1 FROM access_codes 
      WHERE role_name = 'sector' AND sector_id = p_sector_id AND code = p_pin
    ) INTO v_is_valid;
    
    -- If not, try generic sector code
    IF NOT v_is_valid THEN
      SELECT EXISTS (
        SELECT 1 FROM access_codes 
        WHERE role_name = 'sector' AND sector_id IS NULL AND code = p_pin
      ) INTO v_is_valid;
    END IF;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM access_codes 
      WHERE role_name = p_role AND code = p_pin
    ) INTO v_is_valid;
  END IF;

  IF v_is_valid THEN
    -- Guardar la sesión vinculada al auth.uid() actual
    INSERT INTO active_sessions (user_id, role_name, sector_id)
    VALUES (auth.uid(), p_role, p_sector_id)
    ON CONFLICT (user_id) DO UPDATE 
    SET role_name = EXCLUDED.role_name, sector_id = EXCLUDED.sector_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;


-- 3. Asegurar la tabla de códigos de acceso
-- Quitamos el acceso público para que nadie pueda leer los PINs
DROP POLICY IF EXISTS "Lectura pública de códigos para login" ON access_codes;


-- 4. Actualizar Políticas (RLS) para Traslados (transfers)
DROP POLICY IF EXISTS "Acceso público a traslados" ON transfers;

-- Todos los autenticados pueden LEER
CREATE POLICY "Lectura de traslados" ON transfers 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM active_sessions WHERE user_id = auth.uid())
);

-- Solo admin y sectores pueden CREAR
CREATE POLICY "Creación de traslados" ON transfers 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM active_sessions 
    WHERE user_id = auth.uid() 
    AND (role_name = 'admin' OR role_name = 'sector')
  )
);

-- Todos los autenticados pueden EDITAR (actualizar estado)
CREATE POLICY "Edición de traslados" ON transfers 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM active_sessions WHERE user_id = auth.uid())
);

-- Solo admin puede ELIMINAR
CREATE POLICY "Eliminación de traslados" ON transfers 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM active_sessions WHERE user_id = auth.uid() AND role_name = 'admin')
);
