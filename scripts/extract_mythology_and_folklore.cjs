// Script utilitário (uso único) para extrair `worldMythologiesMetadata` de
// src/data/mythologyData.ts e `folcloreBrasileiroData` de src/data/folcloreData.ts,
// gerando migrations SQL de seed para as tabelas `mythologies` e `folklore_entries`.
//
// Uso: node scripts/extract_mythology_and_folklore.cjs

const fs = require('fs');
const path = require('path');

const MYTHOLOGY_PATH = path.join(__dirname, '..', 'src', 'data', 'mythologyData.ts');
const FOLCLORE_PATH = path.join(__dirname, '..', 'src', 'data', 'folcloreData.ts');
const OUT_MYTHOLOGY = path.join(__dirname, '..', 'database', 'migrations', '20260730000002_create_and_seed_mythologies.sql');
const OUT_FOLCLORE = path.join(__dirname, '..', 'database', 'migrations', '20260730000003_create_and_seed_folklore.sql');

function extractObjectLiteral(source, startMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker not found: ${startMarker}`);
  const objStart = source.indexOf('{', startIdx + startMarker.length);
  let depth = 0;
  let i = objStart;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return source.slice(objStart, i);
}

function sqlEscape(str) {
  if (str === null || str === undefined) return null;
  return String(str).replace(/'/g, "''");
}

function jsonbLiteral(value) {
  const json = JSON.stringify(value ?? null);
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

function slugify(id) {
  return String(id)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// --- 1. MITOLOGIAS ---
const mythologySource = fs.readFileSync(MYTHOLOGY_PATH, 'utf-8');
const mythologyLiteralText = extractObjectLiteral(mythologySource, 'export const worldMythologiesMetadata: Record<string, MythologyMetadata> = ');
// eslint-disable-next-line no-new-func
const worldMythologiesMetadata = new Function(`return ${mythologyLiteralText};`)();

const mythologyIds = Object.keys(worldMythologiesMetadata);
console.log(`Extraídas ${mythologyIds.length} mitologias: ${mythologyIds.join(', ')}`);

const mythologyRows = mythologyIds.map((key) => {
  const m = worldMythologiesMetadata[key];
  const id = slugify(key);
  return `('${id}', '${sqlEscape(m.name)}', '${sqlEscape(m.region)}', '${sqlEscape(m.era)}', '${sqlEscape(m.pantheon)}', '${sqlEscape(m.creator)}', '${sqlEscape(m.cosmologyDesc)}', '${sqlEscape(m.creationDesc)}', '${sqlEscape(m.originMap)}', ${jsonbLiteral(m.deities || [])}, ${jsonbLiteral(m.heroes || [])}, ${jsonbLiteral(m.creatures || [])}, ${jsonbLiteral(m.items || [])}, ${jsonbLiteral(m.places || [])}, ${jsonbLiteral(m.timeline || [])}, ${jsonbLiteral(m.genealogy || [])}, ${jsonbLiteral(m.literature || [])}, ${jsonbLiteral(m.modernInfluence || [])}, ${jsonbLiteral(m.sources || [])}, ${jsonbLiteral(m.bibliography || [])}, 'published', true)`;
});

const mythologySql = `-- Migration: Cria e popula a tabela 'mythologies' com o conteúdo integral extraído
-- de src/data/mythologyData.ts (worldMythologiesMetadata) do protótipo React do CHRONOS.
-- Sprint: 5.2.3
-- Date: 30/07/2026
-- Author: Equipe de Engenharia CHRONOS (extração automatizada via scripts/extract_mythology_and_folklore.cjs)

BEGIN;

CREATE TABLE IF NOT EXISTS mythologies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    era VARCHAR(255) NOT NULL,
    pantheon VARCHAR(255) NOT NULL,
    creator TEXT NOT NULL,
    cosmology_desc TEXT NOT NULL,
    creation_desc TEXT NOT NULL,
    origin_map TEXT,
    deities JSONB NOT NULL DEFAULT '[]'::jsonb,
    heroes JSONB NOT NULL DEFAULT '[]'::jsonb,
    creatures JSONB NOT NULL DEFAULT '[]'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    places JSONB NOT NULL DEFAULT '[]'::jsonb,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    genealogy JSONB NOT NULL DEFAULT '[]'::jsonb,
    literature JSONB NOT NULL DEFAULT '[]'::jsonb,
    modern_influence JSONB NOT NULL DEFAULT '[]'::jsonb,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    bibliography JSONB NOT NULL DEFAULT '[]'::jsonb,
    publication_status VARCHAR(50) NOT NULL DEFAULT 'published',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mythologies_updated_at ON mythologies;
CREATE TRIGGER trigger_mythologies_updated_at
BEFORE UPDATE ON mythologies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE mythologies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_mythologies_select_public ON mythologies;
CREATE POLICY policy_mythologies_select_public ON mythologies FOR SELECT USING (true);

DROP POLICY IF EXISTS policy_mythologies_insert_authenticated ON mythologies;
CREATE POLICY policy_mythologies_insert_authenticated ON mythologies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS policy_mythologies_update_authenticated ON mythologies;
CREATE POLICY policy_mythologies_update_authenticated ON mythologies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS policy_mythologies_delete_authenticated ON mythologies;
CREATE POLICY policy_mythologies_delete_authenticated ON mythologies FOR DELETE TO authenticated USING (true);

INSERT INTO mythologies (id, name, region, era, pantheon, creator, cosmology_desc, creation_desc, origin_map, deities, heroes, creatures, items, places, timeline, genealogy, literature, modern_influence, sources, bibliography, publication_status, ativo)
VALUES
${mythologyRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    region = EXCLUDED.region,
    era = EXCLUDED.era,
    pantheon = EXCLUDED.pantheon,
    creator = EXCLUDED.creator,
    cosmology_desc = EXCLUDED.cosmology_desc,
    creation_desc = EXCLUDED.creation_desc,
    origin_map = EXCLUDED.origin_map,
    deities = EXCLUDED.deities,
    heroes = EXCLUDED.heroes,
    creatures = EXCLUDED.creatures,
    items = EXCLUDED.items,
    places = EXCLUDED.places,
    timeline = EXCLUDED.timeline,
    genealogy = EXCLUDED.genealogy,
    literature = EXCLUDED.literature,
    modern_influence = EXCLUDED.modern_influence,
    sources = EXCLUDED.sources,
    bibliography = EXCLUDED.bibliography,
    publication_status = EXCLUDED.publication_status,
    ativo = EXCLUDED.ativo,
    updated_at = now();

COMMIT;
`;

fs.writeFileSync(OUT_MYTHOLOGY, mythologySql, 'utf-8');
console.log(`Migration SQL de mitologias gerada em: ${OUT_MYTHOLOGY}`);

// --- 2. FOLCLORE BRASILEIRO ---
const folcloreSource = fs.readFileSync(FOLCLORE_PATH, 'utf-8');
const folcloreLiteralText = extractObjectLiteral(folcloreSource, 'export const folcloreBrasileiroData: Record<string, MythologyDetail> = ');
// eslint-disable-next-line no-new-func
const folcloreBrasileiroData = new Function(`return ${folcloreLiteralText};`)();

const folcloreKeys = Object.keys(folcloreBrasileiroData);
console.log(`Extraídas ${folcloreKeys.length} entradas de folclore: ${folcloreKeys.join(', ')}`);

const folcloreRows = folcloreKeys.map((key, index) => {
  const entry = folcloreBrasileiroData[key];
  const id = slugify(key) || `entrada-${index}`;
  return `('${id}', '${sqlEscape(key)}', '${sqlEscape(entry.title)}', '${sqlEscape(entry.details)}', ${jsonbLiteral(entry.bullets || [])}, '${sqlEscape(entry.scientificNote)}', ${index}, 'published', true)`;
});

const folcloreSql = `-- Migration: Cria e popula a tabela 'folklore_entries' com o conteúdo integral extraído
-- de src/data/folcloreData.ts (folcloreBrasileiroData) do protótipo React do CHRONOS.
-- Sprint: 5.2.4
-- Date: 30/07/2026
-- Author: Equipe de Engenharia CHRONOS (extração automatizada via scripts/extract_mythology_and_folklore.cjs)

BEGIN;

CREATE TABLE IF NOT EXISTS folklore_entries (
    id VARCHAR(255) PRIMARY KEY,
    topic VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
    scientific_note TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    publication_status VARCHAR(50) NOT NULL DEFAULT 'published',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folklore_entries_display_order ON folklore_entries(display_order);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_folklore_entries_updated_at ON folklore_entries;
CREATE TRIGGER trigger_folklore_entries_updated_at
BEFORE UPDATE ON folklore_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE folklore_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_folklore_entries_select_public ON folklore_entries;
CREATE POLICY policy_folklore_entries_select_public ON folklore_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS policy_folklore_entries_insert_authenticated ON folklore_entries;
CREATE POLICY policy_folklore_entries_insert_authenticated ON folklore_entries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS policy_folklore_entries_update_authenticated ON folklore_entries;
CREATE POLICY policy_folklore_entries_update_authenticated ON folklore_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS policy_folklore_entries_delete_authenticated ON folklore_entries;
CREATE POLICY policy_folklore_entries_delete_authenticated ON folklore_entries FOR DELETE TO authenticated USING (true);

INSERT INTO folklore_entries (id, topic, title, details, bullets, scientific_note, display_order, publication_status, ativo)
VALUES
${folcloreRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    topic = EXCLUDED.topic,
    title = EXCLUDED.title,
    details = EXCLUDED.details,
    bullets = EXCLUDED.bullets,
    scientific_note = EXCLUDED.scientific_note,
    display_order = EXCLUDED.display_order,
    publication_status = EXCLUDED.publication_status,
    ativo = EXCLUDED.ativo,
    updated_at = now();

COMMIT;
`;

fs.writeFileSync(OUT_FOLCLORE, folcloreSql, 'utf-8');
console.log(`Migration SQL de folclore gerada em: ${OUT_FOLCLORE}`);
