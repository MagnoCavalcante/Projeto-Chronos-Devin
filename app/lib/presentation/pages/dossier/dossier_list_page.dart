import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/models/history_card.dart';
import '../../../shared/models/profile.dart';
import '../../../shared/services/auth_service.dart';
import '../../../shared/services/dossier_remote_datasource.dart';
import 'dossier_page.dart';

/// Lista dos Dossiês Históricos do CHRONOS com paywall por premium.
///
/// Usuários não autenticados ou sem `is_premium` podem acessar apenas
/// 1 dossiê de degustação. O restante é apresentado através do card de upgrade.
class DossierListPage extends StatefulWidget {
  const DossierListPage({super.key});

  @override
  State<DossierListPage> createState() => _DossierListPageState();
}

class _DossierListPageState extends State<DossierListPage> {
  final DossierRemoteDataSource _dataSource = DossierRemoteDataSource();
  final AuthService _authService = AuthService.instance;

  late Future<List<HistoryCard>> _dossiersFuture;
  Profile? _currentProfile;

  @override
  void initState() {
    super.initState();
    _dossiersFuture = _dataSource.getAllDossiers();
    _currentProfile = _authService.currentProfile;
    _authService.profileStream.listen((profile) {
      if (mounted) setState(() => _currentProfile = profile);
    });
  }

  Future<void> _reload() async {
    setState(() {
      _dossiersFuture = _dataSource.getAllDossiers();
    });
    await _dossiersFuture;
  }

  bool get _canAccessAll => _currentProfile?.isPremium == true;

  @override
  Widget build(BuildContext context) {
    return ChronosScaffold(
      title: 'Acervo de Dossiês',
      body: RefreshIndicator(
        onRefresh: _reload,
        child: FutureBuilder<List<HistoryCard>>(
          future: _dossiersFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: ChronosLoading(message: 'Carregando acervo de dossiês...'));
            }
            if (snapshot.hasError) {
              return ListView(
                children: [
                  const SizedBox(height: 80),
                  Icon(Icons.error_outline_rounded, size: 48, color: ChronosColors.textMuted),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      'Não foi possível carregar o acervo de dossiês.\n${snapshot.error}',
                      textAlign: TextAlign.center,
                      style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
                    ),
                  ),
                ],
              );
            }

            final dossiers = snapshot.data ?? const [];
            if (dossiers.isEmpty) {
              return const Center(
                child: Text('Nenhum dossiê publicado no momento.'),
              );
            }

            final freeDossier = dossiers.firstWhere(
              (d) => d.isFree,
              orElse: () => dossiers.first,
            );
            final remainingDossiers = dossiers.where((d) => d.id != freeDossier.id).toList();

            if (_canAccessAll) {
              return ListView.separated(
                padding: const EdgeInsets.all(ChronosSpacing.lg),
                itemCount: dossiers.length,
                separatorBuilder: (_, __) => const SizedBox(height: ChronosSpacing.md),
                itemBuilder: (context, index) => _DossierListTile(dossier: dossiers[index]),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(ChronosSpacing.lg),
              itemCount: remainingDossiers.isNotEmpty ? 3 : 1,
              separatorBuilder: (_, __) => const SizedBox(height: ChronosSpacing.md),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _DossierSampleHeader(),
                      const SizedBox(height: ChronosSpacing.sm),
                      _DossierListTile(dossier: freeDossier),
                    ],
                  );
                }
                if (index == 1) {
                  return const PremiumPaywallCard();
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mais ${remainingDossiers.length} dossiês disponíveis',
                      style: ChronosTypography.labelMedium.copyWith(color: ChronosColors.textMuted),
                    ),
                    const SizedBox(height: ChronosSpacing.sm),
                    ...remainingDossiers.map(
                      (d) => Opacity(
                        opacity: 0.45,
                        child: _LockedDossierTile(title: d.title, period: d.period, era: d.era),
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _DossierSampleHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: ChronosColors.accent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: ChronosColors.accent.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.local_cafe_rounded, size: 16, color: ChronosColors.accent),
          const SizedBox(width: 8),
          Text(
            'Dossiê de degustação grátis',
            style: ChronosTypography.labelMedium.copyWith(color: ChronosColors.accent),
          ),
        ],
      ),
    );
  }
}

class _LockedDossierTile extends StatelessWidget {
  final String title;
  final String period;
  final String era;

  const _LockedDossierTile({required this.title, required this.period, required this.era});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: ChronosSpacing.sm),
      padding: const EdgeInsets.all(ChronosSpacing.md),
      decoration: BoxDecoration(
        color: ChronosColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ChronosColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.lock_outline_rounded, color: ChronosColors.textMuted, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: ChronosTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '$period • $era',
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DossierListTile extends StatelessWidget {
  final HistoryCard dossier;

  const _DossierListTile({required this.dossier});

  Color get _evidenceColor {
    switch (dossier.evidenceLevel) {
      case 'high':
        return Colors.green;
      case 'good':
        return Colors.lightGreen;
      case 'debate':
        return Colors.orange;
      case 'hypothesis':
        return Colors.amber;
      case 'mythological':
        return Colors.purpleAccent;
      default:
        return ChronosColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      borderColor: ChronosColors.border,
      borderWidth: 1.0,
      padding: const EdgeInsets.all(ChronosSpacing.lg),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => DossierPage(card: dossier)),
        );
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 56,
            decoration: BoxDecoration(
              color: _evidenceColor,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          ChronosSpacing.hSizedBoxMD,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dossier.title,
                  style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${dossier.period} • ${dossier.era}',
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary),
                ),
                const SizedBox(height: 6),
                Text(
                  dossier.summary,
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textMuted),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: ChronosColors.textMuted),
        ],
      ),
    );
  }
}
