// Script utilitário (uso único) para extrair `mockCards` de src/components/MainView.tsx
// e gerar uma migration SQL de seed para a tabela `dossiers` no Supabase.
//
// Uso: node scripts/extract_dossiers.js

const fs = require('fs');
const path = require('path');

const MAIN_VIEW_PATH = path.join(__dirname, '..', 'src', 'components', 'MainView.tsx');
const OUTPUT_SQL_PATH = path.join(__dirname, '..', 'database', 'migrations', '20260730000001_create_and_seed_dossiers.sql');

function extractArrayLiteral(source, startMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker not found: ${startMarker}`);
  const arrayStart = source.indexOf('[', startIdx + startMarker.length);
  let depth = 0;
  let i = arrayStart;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return source.slice(arrayStart, i);
}

const source = fs.readFileSync(MAIN_VIEW_PATH, 'utf-8');
const arrayLiteralText = extractArrayLiteral(source, 'const mockCards: HistoryCard[] = ');

// O literal é JS válido (objetos com strings/numeros), então podemos avaliá-lo
// diretamente via Function constructor em um contexto isolado.
// eslint-disable-next-line no-new-func
const mockCards = new Function(`return ${arrayLiteralText};`)();

console.log(`Extraídos ${mockCards.length} dossiês de mockCards.`);

function sqlEscape(str) {
  if (str === null || str === undefined) return null;
  return String(str).replace(/'/g, "''");
}

function jsonbLiteral(value) {
  const json = JSON.stringify(value ?? null);
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

function slugify(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const rows = mockCards.map((card) => {
  const id = slugify(card.id);
  return `('${id}', '${sqlEscape(card.category)}', '${sqlEscape(card.period)}', '${sqlEscape(card.title)}', '${sqlEscape(card.era)}', '${sqlEscape(card.summary)}', '${sqlEscape(card.evidenceLevel)}', ${jsonbLiteral(card.fact)}, ${jsonbLiteral(card.interpretation)}, ${jsonbLiteral(card.hypothesis)}, ${jsonbLiteral(card.timeline || [])}, ${jsonbLiteral(card.characters || [])}, ${jsonbLiteral(card.sources || [])}, 'published', true)`;
});

const sql = `-- Migration: Cria e popula a tabela 'dossiers' com o conteúdo integral extraído
-- de src/components/MainView.tsx (mockCards) do protótipo React do CHRONOS.
-- Sprint: 5.2.2
-- Date: 30/07/2026
-- Author: Equipe de Engenharia CHRONOS (extração automatizada via scripts/extract_dossiers.js)

BEGIN;

CREATE TABLE IF NOT EXISTS dossiers (
    id VARCHAR(255) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    period VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    era VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    evidence_level VARCHAR(50) NOT NULL,
    fact JSONB NOT NULL,
    interpretation JSONB NOT NULL,
    hypothesis JSONB NOT NULL,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    characters JSONB NOT NULL DEFAULT '[]'::jsonb,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    publication_status VARCHAR(50) NOT NULL DEFAULT 'published',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dossiers_period ON dossiers(period);
CREATE INDEX IF NOT EXISTS idx_dossiers_category ON dossiers(category);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dossiers_updated_at ON dossiers;
CREATE TRIGGER trigger_dossiers_updated_at
BEFORE UPDATE ON dossiers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_dossiers_select_public ON dossiers;
CREATE POLICY policy_dossiers_select_public
ON dossiers
FOR SELECT
USING (true);

DROP POLICY IF EXISTS policy_dossiers_insert_authenticated ON dossiers;
CREATE POLICY policy_dossiers_insert_authenticated
ON dossiers
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS policy_dossiers_update_authenticated ON dossiers;
CREATE POLICY policy_dossiers_update_authenticated
ON dossiers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS policy_dossiers_delete_authenticated ON dossiers;
CREATE POLICY policy_dossiers_delete_authenticated
ON dossiers
FOR DELETE
TO authenticated
USING (true);

INSERT INTO dossiers (id, category, period, title, era, summary, evidence_level, fact, interpretation, hypothesis, timeline, characters, sources, publication_status, ativo)
VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    period = EXCLUDED.period,
    title = EXCLUDED.title,
    era = EXCLUDED.era,
    summary = EXCLUDED.summary,
    evidence_level = EXCLUDED.evidence_level,
    fact = EXCLUDED.fact,
    interpretation = EXCLUDED.interpretation,
    hypothesis = EXCLUDED.hypothesis,
    timeline = EXCLUDED.timeline,
    characters = EXCLUDED.characters,
    sources = EXCLUDED.sources,
    publication_status = EXCLUDED.publication_status,
    ativo = EXCLUDED.ativo,
    updated_at = now();

COMMIT;
`;

fs.writeFileSync(OUTPUT_SQL_PATH, sql, 'utf-8');
console.log(`Migration SQL gerada em: ${OUTPUT_SQL_PATH}`);
