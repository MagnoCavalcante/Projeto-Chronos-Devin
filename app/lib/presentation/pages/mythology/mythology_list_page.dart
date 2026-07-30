import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/models/mythology.dart';
import '../../../shared/services/mythology_remote_datasource.dart';
import 'folklore_list_page.dart';
import 'mythology_detail_page.dart';

/// Lista do acervo de Mitologias Mundiais do CHRONOS, migradas de
/// src/data/mythologyData.ts, incluindo acesso dedicado ao Folclore Brasileiro.
class MythologyListPage extends StatefulWidget {
  const MythologyListPage({super.key});

  @override
  State<MythologyListPage> createState() => _MythologyListPageState();
}

class _MythologyListPageState extends State<MythologyListPage> {
  final MythologyRemoteDataSource _dataSource = MythologyRemoteDataSource();
  late Future<List<Mythology>> _mythologiesFuture;

  @override
  void initState() {
    super.initState();
    _mythologiesFuture = _dataSource.getAllMythologies();
  }

  @override
  Widget build(BuildContext context) {
    return ChronosScaffold(
      title: 'Mitologias do Mundo',
      body: FutureBuilder<List<Mythology>>(
        future: _mythologiesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: ChronosLoading(message: 'Carregando mitologias...'));
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Não foi possível carregar as mitologias.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
                ),
              ),
            );
          }

          final mythologies = snapshot.data ?? const [];

          return ListView(
            padding: const EdgeInsets.all(ChronosSpacing.lg),
            children: [
              _FolkloreEntryCard(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const FolkloreListPage()),
                  );
                },
              ),
              const SizedBox(height: ChronosSpacing.md),
              ...mythologies.map(
                (mythology) => Padding(
                  padding: const EdgeInsets.only(bottom: ChronosSpacing.md),
                  child: _MythologyCard(
                    mythology: mythology,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => MythologyDetailPage(mythology: mythology)),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _MythologyCard extends StatelessWidget {
  final Mythology mythology;
  final VoidCallback onTap;

  const _MythologyCard({required this.mythology, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      borderColor: ChronosColors.border,
      borderWidth: 1.0,
      padding: const EdgeInsets.all(ChronosSpacing.lg),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.purpleAccent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.auto_awesome_rounded, color: Colors.purpleAccent, size: 24),
          ),
          ChronosSpacing.hSizedBoxLG,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  mythology.name,
                  style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '${mythology.region} • ${mythology.era}',
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary),
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

class _FolkloreEntryCard extends StatelessWidget {
  final VoidCallback onTap;

  const _FolkloreEntryCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      borderColor: Colors.green.withOpacity(0.3),
      borderWidth: 1.0,
      padding: const EdgeInsets.all(ChronosSpacing.lg),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.park_rounded, color: Colors.green, size: 24),
          ),
          ChronosSpacing.hSizedBoxLG,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Folclore Brasileiro',
                  style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'Saci, Curupira, Iara, Boitatá e outras lendas nacionais.',
                  style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary),
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
