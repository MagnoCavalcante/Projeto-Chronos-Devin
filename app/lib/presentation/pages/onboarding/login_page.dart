import 'package:flutter/material.dart';
import '../../../core/navigation/route_names.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';

/// Tela de Login do CHRONOS.
///
/// Réplica visual simples (sem backend) do protótipo original (LoginView.tsx):
/// qualquer combinação de e-mail e senha válidas conduz o usuário à plataforma.
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;

    Navigator.of(context).pushReplacementNamed(RouteNames.home);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ChronosColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(ChronosSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: ChronosSpacing.xxl),
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
                  'Bem-vindo de volta',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.displaySmall,
                ),
                const SizedBox(height: ChronosSpacing.sm),
                Text(
                  'Acesse sua conta para continuar a explorar a história.',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.bodyMedium,
                ),
                const SizedBox(height: ChronosSpacing.xxl),
                ChronosTextField(
                  controller: _emailController,
                  labelText: 'E-mail',
                  hintText: 'seu@email.com',
                  prefixIcon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Por favor, preencha o e-mail.';
                    }
                    if (!value.contains('@')) {
                      return 'Informe um e-mail válido.';
                    }
                    return null;
                  },
                ),
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
                  validator: (value) {
                    if (value == null || value.length < 6) {
                      return 'A senha deve conter no mínimo 6 caracteres.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: ChronosSpacing.lg),
                ChronosButton(
                  label: 'Entrar',
                  onPressed: _isSubmitting ? null : _handleLogin,
                  isLoading: _isSubmitting,
                  fullWidth: true,
                ),
                const SizedBox(height: ChronosSpacing.md),
                ChronosButton(
                  label: 'Entrar como Convidado',
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
                    'Acervo de demonstração: qualquer credencial é aceita.',
                    textAlign: TextAlign.center,
                    style: ChronosTypography.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
