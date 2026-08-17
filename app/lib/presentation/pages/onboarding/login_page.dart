import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/navigation/route_names.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/services/auth_service.dart';

/// Tela unificada de Login/Cadastro do CHRONOS via Supabase Auth.
///
/// Oferece três modos:
/// - Entrar com e-mail e senha
/// - Cadastrar nova conta
/// - Magic Link por e-mail (senha-less)
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isSubmitting = false;
  String? _feedbackMessage;
  bool _isSuccess = false;

  final _authService = AuthService.instance;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        _clearFeedback();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _clearFeedback() => setState(() => _feedbackMessage = null);

  void _setFeedback(String message, {bool success = false}) {
    setState(() {
      _feedbackMessage = message;
      _isSuccess = success;
    });
  }

  bool get _isMagicLink => _tabController.index == 2;
  bool get _isSignUp => _tabController.index == 1;

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
      _feedbackMessage = null;
    });

    try {
      if (_isMagicLink) {
        await _authService.sendMagicLink(_emailController.text);
        _setFeedback('Link mágico enviado! Verifique seu e-mail.', success: true);
      } else if (_isSignUp) {
        await _authService.signUpWithEmailAndPassword(
          _emailController.text,
          _passwordController.text,
        );
        _setFeedback('Conta criada! Confirme seu e-mail se solicitado.', success: true);
        await Future.delayed(const Duration(milliseconds: 1200));
        if (!mounted) return;
        _navigateHome();
      } else {
        await _authService.signInWithEmailAndPassword(
          _emailController.text,
          _passwordController.text,
        );
        _setFeedback('Bem-vindo de volta!', success: true);
        await Future.delayed(const Duration(milliseconds: 600));
        if (!mounted) return;
        _navigateHome();
      }
    } on AuthException catch (e) {
      _setFeedback(e.message);
    } catch (e) {
      _setFeedback('Erro inesperado. Tente novamente.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _navigateHome() {
    Navigator.of(context).pushReplacementNamed(RouteNames.home);
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Informe o e-mail.';
    }
    if (!value.contains('@') || !value.contains('.')) {
      return 'Informe um e-mail válido.';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value != _passwordController.text) {
      return 'As senhas não coincidem.';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ChronosColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(ChronosSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: ChronosSpacing.xl),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: ChronosColors.surface,
                    border: Border.all(color: ChronosColors.accent.withOpacity(0.4), width: 2),
                  ),
                  child: const Icon(Icons.explore_rounded, size: 40, color: ChronosColors.accent),
                ),
              ),
              const SizedBox(height: ChronosSpacing.lg),
              Text(
                'Acesse o CHRONOS',
                textAlign: TextAlign.center,
                style: ChronosTypography.displaySmall,
              ),
              const SizedBox(height: ChronosSpacing.xs),
              Text(
                'Entre, cadastre-se ou use o Magic Link.',
                textAlign: TextAlign.center,
                style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
              ),
              const SizedBox(height: ChronosSpacing.xl),
              Container(
                decoration: BoxDecoration(
                  color: ChronosColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ChronosColors.border),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: ChronosColors.accent,
                  labelColor: ChronosColors.accent,
                  unselectedLabelColor: ChronosColors.textSecondary,
                  labelStyle: ChronosTypography.labelMedium,
                  unselectedLabelStyle: ChronosTypography.labelMedium,
                  tabs: const [
                    Tab(text: 'Entrar'),
                    Tab(text: 'Cadastrar'),
                    Tab(text: 'Magic Link'),
                  ],
                ),
              ),
              const SizedBox(height: ChronosSpacing.lg),
              Form(
                key: _formKey,
                child: AnimatedBuilder(
                  animation: _tabController,
                  builder: (context, child) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ChronosTextField(
                          controller: _emailController,
                          labelText: 'E-mail',
                          hintText: 'seu@email.com',
                          prefixIcon: Icons.mail_outline_rounded,
                          keyboardType: TextInputType.emailAddress,
                          validator: _validateEmail,
                        ),
                        if (!_isMagicLink) ...[
                          const SizedBox(height: ChronosSpacing.md),
                          ChronosTextField(
                            controller: _passwordController,
                            labelText: 'Senha',
                            hintText: '••••••••',
                            prefixIcon: Icons.lock_outline_rounded,
                            obscureText: _obscurePassword,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                color: ChronosColors.textMuted,
                                size: 20,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            validator: _isSignUp ? _validatePassword : _validatePassword,
                          ),
                        ],
                        if (_isSignUp) ...[
                          const SizedBox(height: ChronosSpacing.md),
                          ChronosTextField(
                            controller: _confirmPasswordController,
                            labelText: 'Confirmar Senha',
                            hintText: '••••••••',
                            prefixIcon: Icons.lock_outline_rounded,
                            obscureText: true,
                            validator: _validateConfirmPassword,
                          ),
                        ],
                        if (_feedbackMessage != null) ...[
                          const SizedBox(height: ChronosSpacing.md),
                          Container(
                            padding: const EdgeInsets.all(ChronosSpacing.md),
                            decoration: BoxDecoration(
                              color: _isSuccess
                                  ? Colors.green.withOpacity(0.1)
                                  : Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: _isSuccess ? Colors.green : Colors.red,
                                width: 0.5,
                              ),
                            ),
                            child: Text(
                              _feedbackMessage!,
                              style: ChronosTypography.bodySmall.copyWith(
                                color: _isSuccess ? Colors.greenAccent : Colors.redAccent,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                        const SizedBox(height: ChronosSpacing.lg),
                        ChronosButton(
                          label: _isMagicLink
                              ? 'Enviar Link Mágico'
                              : _isSignUp
                                  ? 'Criar Conta'
                                  : 'Entrar',
                          onPressed: _isSubmitting ? null : _handleSubmit,
                          isLoading: _isSubmitting,
                          fullWidth: true,
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: ChronosSpacing.md),
              ChronosButton(
                label: 'Explorar como Convidado',
                variant: ChronosButtonVariant.outline,
                icon: Icons.person_outline_rounded,
                onPressed: _isSubmitting
                    ? null
                    : () => Navigator.of(context).pushReplacementNamed(RouteNames.home),
                fullWidth: true,
              ),
              const SizedBox(height: ChronosSpacing.lg),
              Center(
                child: Text(
                  'Ao acessar, você concorda com os princípios de evidência do CHRONOS.',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textMuted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
