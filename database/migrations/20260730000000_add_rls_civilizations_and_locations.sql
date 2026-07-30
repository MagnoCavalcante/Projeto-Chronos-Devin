-- Migration: Ativa RLS e políticas de leitura pública para civilizations e historical_locations
-- Description: A migration 20260719000001 criou as tabelas e inseriu os dados, mas não configurou
--              RLS/policies, deixando as tabelas inacessíveis para o cliente anônimo (Flutter/Web).
-- Sprint: 5.2.1
-- Date: 30/07/2026
-- Author: Equipe de Engenharia CHRONOS

BEGIN;

-- 1. Ativação do Row Level Security (RLS) para civilizations
ALTER TABLE civilizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_civilizations_select_public ON civilizations;
CREATE POLICY policy_civilizations_select_public
ON civilizations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS policy_civilizations_insert_authenticated ON civilizations;
CREATE POLICY policy_civilizations_insert_authenticated
ON civilizations
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS policy_civilizations_update_authenticated ON civilizations;
CREATE POLICY policy_civilizations_update_authenticated
ON civilizations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS policy_civilizations_delete_authenticated ON civilizations;
CREATE POLICY policy_civilizations_delete_authenticated
ON civilizations
FOR DELETE
TO authenticated
USING (true);

-- 2. Ativação do Row Level Security (RLS) para historical_locations
ALTER TABLE historical_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_historical_locations_select_public ON historical_locations;
CREATE POLICY policy_historical_locations_select_public
ON historical_locations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS policy_historical_locations_insert_authenticated ON historical_locations;
CREATE POLICY policy_historical_locations_insert_authenticated
ON historical_locations
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS policy_historical_locations_update_authenticated ON historical_locations;
CREATE POLICY policy_historical_locations_update_authenticated
ON historical_locations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS policy_historical_locations_delete_authenticated ON historical_locations;
CREATE POLICY policy_historical_locations_delete_authenticated
ON historical_locations
FOR DELETE
TO authenticated
USING (true);

COMMIT;
