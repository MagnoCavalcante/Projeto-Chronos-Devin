import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/models/mythology.dart';
import '../../../shared/services/mythology_remote_datasource.dart';

/// Tela do Folclore Brasileiro, exibindo as seções migradas de
/// src/data/folcloreData.ts (Introdução, Cosmologia, Criaturas, etc.).
class FolkloreListPage extends StatefulWidget {
  const FolkloreListPage({super.key});

  @override
  State<FolkloreListPage> createState() => _FolkloreListPageState();
}

class _FolkloreListPageState extends State<FolkloreListPage> {
  final MythologyRemoteDataSource _dataSource = MythologyRemoteDataSource();
  late Future<List<FolkloreEntry>> _entriesFuture;

  @override
  void initState() {
    super.initState();
    _entriesFuture = _dataSource.getAllFolkloreEntries();
  }

  @override
  Widget build(BuildContext context) {
    return ChronosScaffold(
      title: 'Folclore Brasileiro',
      body: FutureBuilder<List<FolkloreEntry>>(
        future: _entriesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: ChronosLoading(message: 'Carregando folclore...'));
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Não foi possível carregar o folclore.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
                ),
              ),
            );
          }

          final entries = snapshot.data ?? const [];

          return ListView.builder(
            padding: const EdgeInsets.all(ChronosSpacing.lg),
            itemCount: entries.length,
            itemBuilder: (context, index) {
              final entry = entries[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: ChronosSpacing.md),
                child: Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    initiallyExpanded: index == 0,
                    tilePadding: const EdgeInsets.symmetric(horizontal: ChronosSpacing.md),
                    title: Text(
                      entry.title,
                      style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      entry.topic,
                      style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary),
                    ),
                    backgroundColor: ChronosColors.surfaceLight,
                    collapsedBackgroundColor: ChronosColors.surfaceLight,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: ChronosColors.border),
                    ),
                    collapsedShape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: ChronosColors.border),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                          ChronosSpacing.md,
                          0,
                          ChronosSpacing.md,
                          ChronosSpacing.md,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.details,
                              style: ChronosTypography.bodyMedium.copyWith(
                                color: ChronosColors.textSecondary,
                                height: 1.5,
                              ),
                            ),
                            if (entry.bullets.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              ...entry.bullets.map(
                                (b) => Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('•  '),
                                      Expanded(
                                        child: Text(
                                          b,
                                          style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                            if (entry.scientificNote != null) ...[
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.all(ChronosSpacing.sm),
                                decoration: BoxDecoration(
                                  color: ChronosColors.accent.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  entry.scientificNote!,
                                  style: ChronosTypography.bodySmall.copyWith(
                                    color: ChronosColors.accent,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
