import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../../core/utils/logger.dart';
import '../models/profile.dart';

/// Serviço responsável por gerenciar autenticação e perfil do usuário no CHRONOS.
///
/// Abstrai operações de login, cadastro, recuperação de senha, logout e consulta
/// do perfil premium no Supabase Auth + tabela `public.profiles`.
class AuthService {
  AuthService._();

  static final AuthService instance = AuthService._();

  final _client = SupabaseConfig.client;
  StreamSubscription<AuthState>? _authStateSubscription;

  Profile? _currentProfile;
  final _profileController = StreamController<Profile?>.broadcast();

  /// Stream reativa do perfil do usuário autenticado (ou null se deslogado/não premium).
  Stream<Profile?> get profileStream => _profileController.stream;

  /// Retorna o usuário atualmente autenticado, ou null.
  User? get currentUser => _client.auth.currentUser;

  /// Indica se existe um usuário autenticado no momento.
  bool get isAuthenticated => currentUser != null;

  /// Perfil em cache do usuário autenticado.
  Profile? get currentProfile => _currentProfile;

  /// Inicializa o serviço carregando o perfil do usuário atual, se houver.
  Future<void> initialize() async {
    final user = currentUser;
    if (user != null) {
      await _loadProfile(user.id);
    }
    _authStateSubscription = _client.auth.onAuthStateChange.listen(_onAuthStateChanged);
  }

  void dispose() {
    _authStateSubscription?.cancel();
    _profileController.close();
  }

  Future<void> _onAuthStateChanged(AuthState state) async {
    final event = state.event;
    final sessionUser = state.session?.user;

    if (event == AuthChangeEvent.signedIn && sessionUser != null) {
      await _loadProfile(sessionUser.id);
    } else if (event == AuthChangeEvent.signedOut || sessionUser == null) {
      _currentProfile = null;
      _profileController.add(null);
    }
  }

  Future<void> _loadProfile(String userId) async {
    try {
      final response = await _client
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (response != null) {
        _currentProfile = Profile.fromJson(response);
        _profileController.add(_currentProfile);
      } else {
        _currentProfile = null;
        _profileController.add(null);
      }
    } catch (e, st) {
      ChronosLogger.error('Erro ao carregar perfil do usuário', tag: 'AuthService', error: e, stackTrace: st);
      _currentProfile = null;
      _profileController.add(null);
    }
  }

  /// Realiza login com e-mail e senha.
  Future<AuthResponse> signInWithEmailAndPassword(String email, String password) async {
    return _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  /// Cadastra um novo usuário com e-mail e senha.
  Future<AuthResponse> signUpWithEmailAndPassword(String email, String password) async {
    return _client.auth.signUp(
      email: email.trim(),
      password: password,
    );
  }

  /// Envia um Magic Link para o e-mail informado.
  Future<void> sendMagicLink(String email) async {
    await _client.auth.signInWithOtp(
      email: email.trim(),
    );
  }

  /// Realiza logout do usuário atual.
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  /// Atualiza o cache local do perfil (útil após confirmação de pagamento).
  void setPremiumProfile(Profile profile) {
    _currentProfile = profile;
    _profileController.add(profile);
  }
}
