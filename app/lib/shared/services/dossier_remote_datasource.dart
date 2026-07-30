import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../../core/utils/logger.dart';
import '../models/history_card.dart';

/// Exceção técnica para falhas na busca remota de Dossiês (`dossiers`) no Supabase.
class DossierDataSourceException implements Exception {
  final String message;
  final Object? originalError;

  const DossierDataSourceException(this.message, {this.originalError});

  @override
  String toString() => 'DossierDataSourceException: $message';
}

/// Fonte de dados remota responsável por consultar a tabela `dossiers` do Supabase,
/// que armazena o conteúdo integral dos dossiês históricos (Fatos, Interpretações,
/// Hipóteses, Cronologia Interna, Personagens e Fontes) migrado do protótipo web.
class DossierRemoteDataSource {
  final SupabaseClient _client;
  static const String _tag = 'DossierRemoteDataSource';

  DossierRemoteDataSource({SupabaseClient? client}) : _client = client ?? SupabaseConfig.client;

  /// Recupera todos os dossiês ativos e publicados, ordenados por título.
  Future<List<HistoryCard>> getAllDossiers() async {
    try {
      final List<dynamic> response = await _client
          .from('dossiers')
          .select()
          .eq('ativo', true)
          .eq('publication_status', 'published')
          .order('title', ascending: true);

      return response
          .map((item) => HistoryCard.fromJson(item as Map<String, dynamic>))
          .toList(growable: false);
    } catch (e) {
      final errorMsg = 'Erro ao buscar a lista de dossiês: $e';
      ChronosLogger.error(errorMsg, tag: _tag, error: e);
      throw DossierDataSourceException(errorMsg, originalError: e);
    }
  }

  /// Recupera um único dossiê pelo seu `id` (slug).
  Future<HistoryCard> getDossierById(String id) async {
    try {
      final List<dynamic> response = await _client
          .from('dossiers')
          .select()
          .eq('id', id)
          .eq('ativo', true)
          .eq('publication_status', 'published');

      if (response.isEmpty) {
        throw DossierDataSourceException('Dossiê com id "$id" não foi encontrado.');
      }

      return HistoryCard.fromJson(response.first as Map<String, dynamic>);
    } catch (e) {
      if (e is DossierDataSourceException) rethrow;
      final errorMsg = 'Erro ao buscar o dossiê "$id": $e';
      ChronosLogger.error(errorMsg, tag: _tag, error: e);
      throw DossierDataSourceException(errorMsg, originalError: e);
    }
  }
}
