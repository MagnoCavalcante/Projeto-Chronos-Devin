import { supabase } from './supabaseClient';
import { HistoryCard, CharacterBio } from '../types';

// ========================
// ONE-TIME MIGRATION: localStorage → Supabase
// ========================

export async function migrateLocalStorageToSupabase(): Promise<void> {
  const MIGRATION_FLAG = 'chronos_supabase_migrated';

  // Check if migration already done
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
