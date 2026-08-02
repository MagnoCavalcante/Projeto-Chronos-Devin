import { supabase } from './supabaseClient';
import { HistoryCard, CharacterBio } from '../types';

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
