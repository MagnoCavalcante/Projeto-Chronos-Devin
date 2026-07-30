import 'package:flutter/material.dart';
import '../../../core/navigation/route_names.dart';
import '../../../core/theme/theme.dart';

/// Tela de abertura (Splash) do CHRONOS.
///
/// Réplica visual da splash animada do protótipo original (SplashView.tsx),
/// exibida por alguns segundos antes de conduzir o usuário à Boas-Vindas.
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _titleOpacity;
  late final Animation<double> _subtitleOpacity;
  late final Animation<double> _footerOpacity;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..forward();

    _logoScale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.4, curve: Curves.easeOut)),
    );
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.4, curve: Curves.easeOut)),
    );
    _titleOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.2, 0.6, curve: Curves.easeOut)),
    );
    _subtitleOpacity = Tween<double>(begin: 0.0, end: 0.8).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.35, 0.75, curve: Curves.easeOut)),
    );
    _footerOpacity = Tween<double>(begin: 0.0, end: 0.6).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.55, 1.0, curve: Curves.easeOut)),
    );

    Future.delayed(const Duration(milliseconds: 3000), () {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed(RouteNames.welcome);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ChronosColors.primaryDark,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return Padding(
              padding: const EdgeInsets.all(ChronosSpacing.xl),
              child: Column(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Opacity(
                          opacity: _logoOpacity.value,
                          child: Transform.scale(
                            scale: _logoScale.value,
                            child: Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: ChronosColors.surface,
                                border: Border.all(color: ChronosColors.accent.withOpacity(0.4), width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: ChronosColors.accent.withOpacity(0.15),
                                    blurRadius: 30,
                                    spreadRadius: 4,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.access_time_filled_rounded,
                                size: 48,
                                color: ChronosColors.accent,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: ChronosSpacing.xl),
                        Opacity(
                          opacity: _titleOpacity.value,
                          child: Text(
                            'CHRONOS',
                            style: ChronosTypography.displayLarge.copyWith(
                              color: ChronosColors.accentLight,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 6,
                            ),
                          ),
                        ),
                        const SizedBox(height: ChronosSpacing.sm),
                        Opacity(
                          opacity: _subtitleOpacity.value,
                          child: Text(
                            'CONHECIMENTO ATRAVÉS DO TEMPO',
                            textAlign: TextAlign.center,
                            style: ChronosTypography.labelSmall.copyWith(
                              color: ChronosColors.accent,
                              letterSpacing: 3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Opacity(
                    opacity: _footerOpacity.value,
                    child: Column(
                      children: [
                        Text(
                          'NAVEGAÇÃO DE EVIDÊNCIAS HISTÓRICAS',
                          textAlign: TextAlign.center,
                          style: ChronosTypography.labelSmall.copyWith(
                            color: ChronosColors.accentLight.withOpacity(0.4),
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '"Para compreender o presente e navegar pelas eras,\niluminamos os pergaminhos da verdade científica."',
                          textAlign: TextAlign.center,
                          style: ChronosTypography.bodySmall.copyWith(
                            color: ChronosColors.accentLight.withOpacity(0.5),
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
