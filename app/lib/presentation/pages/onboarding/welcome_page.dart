import 'package:flutter/material.dart';
import '../../../core/navigation/route_names.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';

class _WelcomeSlide {
  final IconData icon;
  final Color color;
  final String subtitle;
  final String title;
  final String description;
  final String highlight;

  const _WelcomeSlide({
    required this.icon,
    required this.color,
    required this.subtitle,
    required this.title,
    required this.description,
    required this.highlight,
  });
}

/// Tela de Boas-Vindas (onboarding) do CHRONOS.
///
/// Réplica visual dos slides de apresentação do protótipo original (WelcomeView.tsx).
class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage> {
  int _currentSlide = 0;

  static const List<_WelcomeSlide> _slides = [
    _WelcomeSlide(
      icon: Icons.explore_rounded,
      color: ChronosColors.accent,
      subtitle: 'Nossa Filosofia',
      title: 'Navegação Temporal e Científica',
      description:
          'CHRONOS permite que você viaje pelas eras da humanidade por meio de investigações rigorosas, distinguindo fatos históricos comprovados de interpretações e hipóteses acadêmicas.',
      highlight: 'Passagem do Tempo e Evidências',
    ),
    _WelcomeSlide(
      icon: Icons.shield_rounded,
      color: Colors.teal,
      subtitle: 'Instrumento de Descoberta',
      title: 'Ceticismo e Rigor Bibliográfico',
      description:
          'Toda passagem histórica e documento catalogado no CHRONOS possui correspondência com fontes primárias, manuscritos antigos e relatórios arqueológicos consolidados.',
      highlight: 'Transparência de Fontes',
    ),
    _WelcomeSlide(
      icon: Icons.menu_book_rounded,
      color: Colors.indigo,
      subtitle: 'Rigor Intelectual',
      title: 'Estudo Separado das Mitologias',
      description:
          'Diferenciamos as narrativas míticas e religiosas do fato histórico documental. Estudamos as mitologias como tesouros da cultura humana e de suas tradições literárias.',
      highlight: 'História Viva vs. Tradições Culturais',
    ),
    _WelcomeSlide(
      icon: Icons.refresh_rounded,
      color: Colors.greenAccent,
      subtitle: 'Slogan Oficial',
      title: 'Conhecimento Através do Tempo',
      description:
          'Navegue pelo astrolábio do conhecimento. Nosso banco de dados se ajusta conforme novas escavações e traduções de manuscritos revelam novas verdades científicas.',
      highlight: 'Conhecimento através do tempo',
    ),
  ];

  void _goToLogin() {
    Navigator.of(context).pushReplacementNamed(RouteNames.login);
  }

  void _handleNext() {
    if (_currentSlide < _slides.length - 1) {
      setState(() => _currentSlide++);
    } else {
      _goToLogin();
    }
  }

  void _handleBack() {
    if (_currentSlide > 0) {
      setState(() => _currentSlide--);
    }
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_currentSlide];

    return Scaffold(
      backgroundColor: ChronosColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ChronosSpacing.lg),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: ChronosColors.primary,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: ChronosColors.border),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'C',
                          style: ChronosTypography.titleMedium.copyWith(color: ChronosColors.accent),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'CHRONOS',
                        style: ChronosTypography.titleMedium.copyWith(letterSpacing: 1.5),
                      ),
                    ],
                  ),
                  ChronosButton.text(label: 'PULAR', onPressed: _goToLogin),
                ],
              ),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Column(
                    key: ValueKey(_currentSlide),
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: ChronosColors.surface,
                          shape: BoxShape.circle,
                          border: Border.all(color: ChronosColors.border),
                        ),
                        child: Icon(slide.icon, size: 48, color: slide.color),
                      ),
                      const SizedBox(height: ChronosSpacing.lg),
                      Text(
                        slide.subtitle.toUpperCase(),
                        style: ChronosTypography.labelMedium.copyWith(color: ChronosColors.accent),
                      ),
                      const SizedBox(height: ChronosSpacing.sm),
                      Text(
                        slide.title,
                        textAlign: TextAlign.center,
                        style: ChronosTypography.displaySmall,
                      ),
                      const SizedBox(height: ChronosSpacing.md),
                      Text(
                        slide.description,
                        textAlign: TextAlign.center,
                        style: ChronosTypography.bodyMedium,
                      ),
                      const SizedBox(height: ChronosSpacing.lg),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: ChronosColors.accent.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ChronosColors.accent.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.info_outline_rounded, size: 16, color: ChronosColors.accent),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                slide.highlight,
                                style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.accentLight),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_slides.length, (index) {
                  final isActive = index == _currentSlide;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: isActive ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isActive ? ChronosColors.accent : ChronosColors.border,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
              const SizedBox(height: ChronosSpacing.lg),
              Row(
                children: [
                  if (_currentSlide > 0) ...[
                    Expanded(
                      child: ChronosButton(
                        label: 'Voltar',
                        variant: ChronosButtonVariant.outline,
                        onPressed: _handleBack,
                      ),
                    ),
                    const SizedBox(width: ChronosSpacing.md),
                  ],
                  Expanded(
                    flex: 2,
                    child: ChronosButton(
                      label: _currentSlide == _slides.length - 1 ? 'Entrar na Plataforma' : 'Avançar',
                      icon: Icons.chevron_right_rounded,
                      onPressed: _handleNext,
                      fullWidth: true,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
