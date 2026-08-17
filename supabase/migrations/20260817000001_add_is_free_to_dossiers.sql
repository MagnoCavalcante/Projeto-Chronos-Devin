-- Migration: Adiciona a coluna is_free à tabela dossiers para marcar 1 conteúdo de degustação
-- Sprint: PWA / Venda Direta
-- Date: 17/08/2026

BEGIN;

ALTER TABLE public.dossiers
ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.dossiers.is_free IS 'Quando true, o dossiê é acessível sem assinatura premium (degustação).';

-- Define um dossiê de degustação padrão (exemplo: Sumeria)
UPDATE public.dossiers
SET is_free = true
WHERE id = 'sumeria';

COMMIT;
