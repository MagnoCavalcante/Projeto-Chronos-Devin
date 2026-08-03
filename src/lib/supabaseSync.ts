import { supabase } from './supabaseClient';
import { HistoryCard, CharacterBio } from '../types';

// ========================
// ONE-TIME MIGRATION: localStorage → Supabase
// ========================

export async function migrateLocalStorageToSupabase(): Promise<void> {
  const MIGRATION_FLAG = 'chronos_supabase_migrated';

  // 0. Always try to migrate Gemini API key (in case it was saved before Supabase sync was added)
  try {
    const localKey = localStorage.getItem('chronos_gemini_api_key');
    if (localKey) {
      await saveApiKeyToSupabase(localKey);
    }
  } catch (err) {
    console.error('[Supabase Migration] Erro ao migrar API key:', err);
  }

  // Check if rest of migration already done
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  let migratedCards = 0;
  let migratedBios = 0;

  // 1. Migrate custom cards
  try {
    const savedCards = localStorage.getItem('chronos_custom_cards');
    if (savedCards) {
      const cards: HistoryCard[] = JSON.parse(savedCards);
      for (const card of cards) {
        await saveCardToSupabase(card);
        migratedCards++;
      }
    }
  } catch (err) {
    console.error('[Supabase Migration] Erro ao migrar cards:', err);
  }

  // 2. Migrate character bios (scan all keys starting with chronos_char_bio_)
  try {
    const bioKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chronos_char_bio_')) {
        bioKeys.push(key);
      }
    }

    for (const key of bioKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const bio: CharacterBio = JSON.parse(raw);

        // Extract cardId and characterName from the key
        // Key format: chronos_char_bio_{cardId}_{charName_lower_with_underscores}
        const remaining = key.replace('chronos_char_bio_', '');
        // cardId is everything up to the last underscore segment? No — cardId can have dashes.
        // We stored it as: `${card.id}_${charName.toLowerCase().replace(/\s+/g, '_')}`
        // card.id is a slug like 'guerra-cem-anos' — so we need to split on first underscore
        // But cardId itself won't have underscores (slugs use dashes), so split on first '_'
        const firstUnderscore = remaining.indexOf('_');
        if (firstUnderscore === -1) continue;
        const cardId = remaining.substring(0, firstUnderscore);
        const charNameNormalized = remaining.substring(firstUnderscore + 1);
        // Reverse the normalization: underscores back to spaces, then title-case not needed since we store original name
        const charName = charNameNormalized.replace(/_/g, ' ');

        await saveCharacterBioToSupabase(cardId, charName, bio);
        migratedBios++;
      } catch (err) {
        console.error('[Supabase Migration] Erro ao migrar bio individual:', err);
      }
    }
  } catch (err) {
    console.error('[Supabase Migration] Erro ao escanear bios:', err);
  }

  console.log(`[Supabase Migration] Concluído: ${migratedCards} cards e ${migratedBios} biografias migradas.`);

  // Set flag so migration doesn't run again
  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
}

// ========================
// CUSTOM CARDS (Dossiês)
// ========================

export async function saveCardToSupabase(card: HistoryCard): Promise<void> {
  try {
    const { error } = await supabase
      .from('custom_cards')
      .upsert({
        id: card.id,
        card_data: card,
        title: card.title,
        period: card.period,
        era: card.era,
        modo_aprofundado: card.modo_aprofundado || false,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('[Supabase] Erro ao salvar card:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao salvar card:', err);
  }
}

export async function deleteCardFromSupabase(cardId: string): Promise<void> {
  try {
    const { error } = await supabase.from('custom_cards').delete().eq('id', cardId);
    if (error) console.error('[Supabase] Erro ao deletar card:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao deletar card:', err);
  }
}

export async function loadCardsFromSupabase(): Promise<HistoryCard[]> {
  try {
    const { data, error } = await supabase
      .from('custom_cards')
      .select('card_data')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Erro ao carregar cards:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];
    return data.map((row: any) => row.card_data as HistoryCard);
  } catch (err) {
    console.error('[Supabase] Falha ao carregar cards:', err);
    return [];
  }
}

// ========================
// CHARACTER BIOS
// ========================

export async function saveCharacterBioToSupabase(
  cardId: string,
  characterName: string,
  bio: CharacterBio
): Promise<void> {
  try {
    const bioKey = `${cardId}_${characterName.toLowerCase().replace(/\s+/g, '_')}`;
    const { error } = await supabase
      .from('character_bios')
      .upsert({
        bio_key: bioKey,
        card_id: cardId,
        character_name: characterName,
        bio_data: bio,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('[Supabase] Erro ao salvar biografia:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao salvar biografia:', err);
  }
}

export async function loadCharacterBioFromSupabase(
  cardId: string,
  characterName: string
): Promise<CharacterBio | null> {
  try {
    const bioKey = `${cardId}_${characterName.toLowerCase().replace(/\s+/g, '_')}`;
    const { data, error } = await supabase
      .from('character_bios')
      .select('bio_data')
      .eq('bio_key', bioKey)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Erro ao carregar biografia:', error.message);
      return null;
    }

    if (!data) return null;
    return data.bio_data as CharacterBio;
  } catch (err) {
    console.error('[Supabase] Falha ao carregar biografia:', err);
    return null;
  }
}

// ========================
// GEMINI API KEY
// ========================

export async function saveApiKeyToSupabase(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key_name: 'gemini_api_key',
        key_value: key,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error('[Supabase] Erro ao salvar API key:', error.message, error.code, error.details);
    } else {
      console.log('[Supabase] API key salva com sucesso!');
    }
  } catch (err) {
    console.error('[Supabase] Falha ao salvar API key:', err);
  }
}

export async function loadApiKeyFromSupabase(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key_value')
      .eq('key_name', 'gemini_api_key')
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Erro ao carregar API key:', error.message, error.code, error.details);
      return null;
    }

    console.log('[Supabase] loadApiKeyFromSupabase - data:', data ? 'FOUND' : 'NULL');
    if (!data) return null;
    return data.key_value as string;
  } catch (err) {
    console.error('[Supabase] Falha ao carregar API key:', err);
    return null;
  }
}

export async function deleteApiKeyFromSupabase(): Promise<void> {
  try {
    const { error } = await supabase
      .from('app_settings')
      .delete()
      .eq('key_name', 'gemini_api_key');
    if (error) console.error('[Supabase] Erro ao deletar API key:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao deletar API key:', err);
  }
}

// ========================
// MOCK CARDS (Dados embutidos no app)
// ========================

export async function saveMockCardToSupabase(card: HistoryCard): Promise<void> {
  try {
    const { error } = await supabase
      .from('mock_cards')
      .upsert({
        id: card.id,
        card_data: card,
        title: card.title,
        period: card.period,
        era: card.era,
        modo_aprofundado: card.modo_aprofundado || false,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('[Supabase] Erro ao salvar mock card:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao salvar mock card:', err);
  }
}

export async function loadMockCardsFromSupabase(): Promise<HistoryCard[]> {
  try {
    const { data, error } = await supabase
      .from('mock_cards')
      .select('card_data')
      .order('title', { ascending: true });

    if (error) {
      console.error('[Supabase] Erro ao carregar mock cards:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];
    return data.map((row: any) => row.card_data as HistoryCard);
  } catch (err) {
    console.error('[Supabase] Falha ao carregar mock cards:', err);
    return [];
  }
}

// ========================
// TIMELINE STEPS (Dados embutidos no app)
// ========================

export async function saveTimelineStepToSupabase(step: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('timeline_steps')
      .upsert({
        id: step.id,
        step_data: step,
        title: step.title,
        year: step.year,
        era: step.era,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error('[Supabase] Erro ao salvar timeline step:', error.message);
  } catch (err) {
    console.error('[Supabase] Falha ao salvar timeline step:', err);
  }
}

export async function loadTimelineStepsFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('timeline_steps')
      .select('step_data')
      .order('year', { ascending: true });

    if (error) {
      console.error('[Supabase] Erro ao carregar timeline steps:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];
    return data.map((row: any) => row.step_data);
  } catch (err) {
    console.error('[Supabase] Falha ao carregar timeline steps:', err);
    return [];
  }
}

// ========================
// ONE-TIME MIGRATION: Mock Data → Supabase
// ========================

export async function migrateMockDataToSupabase(
  mockCards: HistoryCard[],
  timelineSteps: any[]
): Promise<void> {
  const MIGRATION_FLAG = 'chronos_mock_data_migrated';

  if (localStorage.getItem(MIGRATION_FLAG)) return;

  let migratedCards = 0;
  let migratedSteps = 0;

  // 1. Migrate mock cards
  for (const card of mockCards) {
    await saveMockCardToSupabase(card);
    migratedCards++;
  }

  // 2. Migrate timeline steps
  for (const step of timelineSteps) {
    await saveTimelineStepToSupabase(step);
    migratedSteps++;
  }

  console.log(`[Supabase Mock Migration] Concluído: ${migratedCards} mock cards e ${migratedSteps} timeline steps migrados.`);

  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
}
