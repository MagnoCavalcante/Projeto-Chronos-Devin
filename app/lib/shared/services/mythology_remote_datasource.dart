import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../../core/utils/logger.dart';
import '../models/mythology.dart';

/// Exceção técnica para falhas na busca remota de Mitologias/Folclore no Supabase.
class MythologyDataSourceException implements Exception {
  final String message;
  final Object? originalError;

  const MythologyDataSourceException(this.message, {this.originalError});

  @override
  String toString() => 'MythologyDataSourceException: $message';
}

/// Fonte de dados remota responsável por consultar as tabelas `mythologies` e
/// `folklore_entries` do Supabase, contendo o acervo mitológico mundial e o
/// folclore brasileiro migrados do protótipo web.
class MythologyRemoteDataSource {
  final SupabaseClient _client;
  static const String _tag = 'MythologyRemoteDataSource';

  MythologyRemoteDataSource({SupabaseClient? client}) : _client = client ?? SupabaseConfig.client;

  Future<List<Mythology>> getAllMythologies() async {
    try {
      final List<dynamic> response = await _client
          .from('mythologies')
          .select()
          .eq('ativo', true)
          .eq('publication_status', 'published')
          .order('name', ascending: true);

      return response.map((item) => Mythology.fromJson(item as Map<String, dynamic>)).toList(growable: false);
    } catch (e) {
      final errorMsg = 'Erro ao buscar a lista de mitologias: $e';
      ChronosLogger.error(errorMsg, tag: _tag, error: e);
      throw MythologyDataSourceException(errorMsg, originalError: e);
    }
  }

  Future<Mythology> getMythologyById(String id) async {
    try {
      final List<dynamic> response = await _client
          .from('mythologies')
          .select()
          .eq('id', id)
          .eq('ativo', true)
          .eq('publication_status', 'published');

      if (response.isEmpty) {
        throw MythologyDataSourceException('Mitologia com id "$id" não foi encontrada.');
      }

      return Mythology.fromJson(response.first as Map<String, dynamic>);
    } catch (e) {
      if (e is MythologyDataSourceException) rethrow;
      final errorMsg = 'Erro ao buscar a mitologia "$id": $e';
      ChronosLogger.error(errorMsg, tag: _tag, error: e);
      throw MythologyDataSourceException(errorMsg, originalError: e);
    }
  }

  Future<List<FolkloreEntry>> getAllFolkloreEntries() async {
    try {
      final List<dynamic> response = await _client
          .from('folklore_entries')
          .select()
          .eq('ativo', true)
          .eq('publication_status', 'published')
          .order('display_order', ascending: true);

      return response.map((item) => FolkloreEntry.fromJson(item as Map<String, dynamic>)).toList(growable: false);
    } catch (e) {
      final errorMsg = 'Erro ao buscar as entradas de folclore brasileiro: $e';
      ChronosLogger.error(errorMsg, tag: _tag, error: e);
      throw MythologyDataSourceException(errorMsg, originalError: e);
    }
  }
}
