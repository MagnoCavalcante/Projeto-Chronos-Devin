-- Migration: Cria a tabela public.profiles vinculada ao auth.users
-- e uma trigger para criar o perfil automaticamente no cadastro.
-- Sprint: PWA / Venda Direta
-- Date: 17/08/2026

BEGIN;

-- Tabela de perfis vinculada ao usuário autenticado do Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comenta a tabela para documentação no painel do Supabase
COMMENT ON TABLE public.profiles IS 'Perfis estendidos dos usuários do CHRONOS, incluindo status premium.';
COMMENT ON COLUMN public.profiles.is_premium IS 'Indica se o usuário comprou acesso completo aos dossiês.';

-- Índice útil para buscas por e-mail
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Função para criar perfil automaticamente após o cadastro no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_premium, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        false,
        COALESCE(NEW.created_at, now()),
        now()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger executada após inserção em auth.users
DROP TRIGGER IF EXISTS trigger_create_profile_after_signup ON auth.users;
CREATE TRIGGER trigger_create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS policy_profiles_select_own ON public.profiles;
CREATE POLICY policy_profiles_select_own
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS policy_profiles_select_public_admin ON public.profiles;
CREATE POLICY policy_profiles_select_public_admin
ON public.profiles
FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS policy_profiles_update_own ON public.profiles;
CREATE POLICY policy_profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMIT;
