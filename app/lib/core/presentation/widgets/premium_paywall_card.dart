import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/build_config.dart';
import '../../theme/theme.dart';

/// Card visual de bloqueio para usuários não premium no CHRONOS.
///
/// Exibe um convite chamativo para liberar o acesso completo aos dossiês.
class PremiumPaywallCard extends StatelessWidget {
  const PremiumPaywallCard({super.key});

  Future<void> _openCheckout() async {
    final uri = Uri.parse(BuildConfig.instance.checkoutUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: ChronosSpacing.md),
      padding: const EdgeInsets.all(ChronosSpacing.lg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1A0F00),
            Color(0xFF2A1B08),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ChronosColors.accent.withOpacity(0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: ChronosColors.accent.withOpacity(0.12),
            blurRadius: 24,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.12),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.amber.withOpacity(0.4)),
            ),
            child: const Icon(
              Icons.workspace_premium_rounded,
              color: Colors.amber,
              size: 36,
            ),
          ),
          const SizedBox(height: ChronosSpacing.lg),
          Text(
            'Conteúdo Exclusivo Premium',
            textAlign: TextAlign.center,
            style: ChronosTypography.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: ChronosColors.textPrimary,
            ),
          ),
          const SizedBox(height: ChronosSpacing.sm),
          Text(
            'Libere todos os Dossiês Históricos e acesse interpretações, hipóteses, cronologias e fontes completas.',
            textAlign: TextAlign.center,
            style: ChronosTypography.bodyMedium.copyWith(
              color: ChronosColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: ChronosSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _openCheckout,
              icon: const Icon(Icons.lock_open_rounded, size: 18),
              label: const Text('Liberar Todos os Dossiês por R\$ 19,90'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                textStyle: ChronosTypography.labelLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: ChronosSpacing.sm),
          Text(
            'Pagamento seguro via Kiwify / Mercado Pago',
            textAlign: TextAlign.center,
            style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textMuted),
          ),
        ],
      ),
    );
  }
}
