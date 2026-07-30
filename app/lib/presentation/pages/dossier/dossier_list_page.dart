import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/models/history_card.dart';
import '../../../shared/services/dossier_remote_datasource.dart';
import 'dossier_page.dart';

/// Lista completa dos Dossiês Históricos disponíveis no acervo do CHRONOS,
/// migrados diretamente do protótipo web (src/components/MainView.tsx).
class DossierListPage extends StatefulWidget {
  const DossierListPage({super.key});

  @override
  State<DossierListPage> createState() => _DossierListPageState();
}

class _DossierListPageState extends State<DossierListPage> {
  final DossierRemoteDataSource _dataSource = DossierRemoteDataSource();
  late Future<List<HistoryCard>> _dossiersFuture;

  @override
  void initState() {
    super.initState();
    _dossiersFuture = _dataSource.getAllDossiers();
  }

  Future<void> _reload() async {
    setState(() {
      _dossiersFuture = _dataSource.getAllDossiers();
    });
    await _dossiersFuture;
  }

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

            return ListView.separated(
              padding: const EdgeInsets.all(ChronosSpacing.lg),
              itemCount: dossiers.length,
              separatorBuilder: (_, __) => const SizedBox(height: ChronosSpacing.md),
              itemBuilder: (context, index) {
                final dossier = dossiers[index];
                return _DossierListTile(dossier: dossier);
              },
            );
          },
        ),
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
