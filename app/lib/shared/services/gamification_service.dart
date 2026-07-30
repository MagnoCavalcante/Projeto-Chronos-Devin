import 'dart:collection';

/// Serviço responsável por gerenciar a gamificação do CHRONOS.
///
/// Controla XP, streak fictício e o conjunto de dossiês concluídos.
/// Em produção, este serviço deve ser substituído por um repositório
/// que sincronize com Supabase/SharedPreferences.
class GamificationService {
  int _xp;
  int _streak;
  final Set<String> _masteredCardIds;

  GamificationService({int initialXp = 0, int initialStreak = 0, Set<String>? masteredCards})
      : _xp = initialXp,
        _streak = initialStreak,
        _masteredCardIds = masteredCards ?? <String>{};

  int get xp => _xp;
  int get streak => _streak;

  UnmodifiableSetView<String> get masteredCardIds =>
      UnmodifiableSetView(_masteredCardIds);

  /// Retorna `true` se o dossiê informado já foi concluído.
  bool isMastered(String cardId) => _masteredCardIds.contains(cardId);

  /// Marca o dossiê como concluído e concede a recompensa de XP.
  ///
  /// Retorna a quantidade de XP ganho (sempre `0` se já estiver concluído).
  int masterCard(String cardId, {int xpReward = 30}) {
    if (_masteredCardIds.contains(cardId)) return 0;

    _masteredCardIds.add(cardId);
    _xp += xpReward;
    _streak += 1;
    return xpReward;
  }

  /// Remove o estado de concluído de um dossiê (útil para testes/desfazer).
  void resetCard(String cardId) {
    _masteredCardIds.remove(cardId);
  }
}
