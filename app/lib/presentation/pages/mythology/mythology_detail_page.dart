import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/theme.dart';
import '../../../shared/models/mythology.dart';

/// Tela de detalhe de uma Mitologia Mundial, exibindo cosmologia, panteão,
/// heróis, criaturas, itens, lugares, linha do tempo, genealogia, literatura,
/// influência moderna, fontes e bibliografia.
class MythologyDetailPage extends StatelessWidget {
  final Mythology mythology;

  const MythologyDetailPage({super.key, required this.mythology});

  @override
  Widget build(BuildContext context) {
    return ChronosScaffold(
      title: mythology.name,
      body: ListView(
        padding: const EdgeInsets.all(ChronosSpacing.lg),
        children: [
          Text(
            '${mythology.region} • ${mythology.era}',
            style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
          ),
          const SizedBox(height: ChronosSpacing.md),
          _Section(title: 'Cosmologia', body: mythology.cosmologyDesc),
          _Section(title: 'Mito de Criação', body: mythology.creationDesc),
          if (mythology.originMap != null) _Section(title: 'Mapa de Origem', body: mythology.originMap!),
          _EntitySection(
            title: 'Panteão (${mythology.pantheon})',
            items: mythology.deities
                .map((d) => _EntityTile(title: d.name, subtitle: d.domain, description: d.desc, tag: d.symbol))
                .toList(),
          ),
          _EntitySection(
            title: 'Heróis',
            items: mythology.heroes
                .map((h) => _EntityTile(title: h.name, subtitle: h.saga, description: h.bio))
                .toList(),
          ),
          _EntitySection(
            title: 'Criaturas',
            items: mythology.creatures
                .map((c) => _EntityTile(title: c.name, subtitle: c.role, description: c.desc))
                .toList(),
          ),
          _EntitySection(
            title: 'Objetos Lendários',
            items: mythology.items
                .map((i) => _EntityTile(title: i.name, subtitle: i.power, description: i.desc))
                .toList(),
          ),
          _EntitySection(
            title: 'Locais Sagrados',
            items: mythology.places
                .map((p) => _EntityTile(title: p.name, subtitle: p.nature, description: p.desc))
                .toList(),
          ),
          if (mythology.timeline.isNotEmpty) _BulletSection(title: 'Linha do Tempo', bullets: mythology.timeline),
          if (mythology.genealogy.isNotEmpty) _BulletSection(title: 'Genealogia', bullets: mythology.genealogy),
          if (mythology.literature.isNotEmpty)
            _EntitySection(
              title: 'Obras Literárias',
              items: mythology.literature
                  .map((l) => _EntityTile(title: l.title, subtitle: l.author, description: l.impact))
                  .toList(),
            ),
          if (mythology.modernInfluence.isNotEmpty)
            _BulletSection(title: 'Influência Moderna', bullets: mythology.modernInfluence),
          if (mythology.sources.isNotEmpty)
            _EntitySection(
              title: 'Fontes',
              items: mythology.sources
                  .map((s) => _EntityTile(title: s.title, subtitle: '${s.author} (${s.year})', description: s.details))
                  .toList(),
            ),
          if (mythology.bibliography.isNotEmpty)
            _BulletSection(title: 'Bibliografia', bullets: mythology.bibliography),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final String body;

  const _Section({required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: ChronosSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(body, style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary, height: 1.5)),
        ],
      ),
    );
  }
}

class _BulletSection extends StatelessWidget {
  final String title;
  final List<String> bullets;

  const _BulletSection({required this.title, required this.bullets});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: ChronosSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          ...bullets.map(
            (b) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('•  '),
                  Expanded(
                    child: Text(b, style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EntitySection extends StatelessWidget {
  final String title;
  final List<_EntityTile> items;

  const _EntitySection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: ChronosSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: ChronosTypography.titleMedium.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...items,
        ],
      ),
    );
  }
}

class _EntityTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String description;
  final String? tag;

  const _EntityTile({required this.title, required this.subtitle, required this.description, this.tag});

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      margin: const EdgeInsets.only(bottom: ChronosSpacing.sm),
      borderColor: ChronosColors.border,
      borderWidth: 1.0,
      padding: const EdgeInsets.all(ChronosSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(title, style: ChronosTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
              ),
              if (tag != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: ChronosColors.accent.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(tag!, style: ChronosTypography.labelSmall.copyWith(color: ChronosColors.accent)),
                ),
            ],
          ),
          const SizedBox(height: 2),
          Text(subtitle, style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.accent)),
          const SizedBox(height: 4),
          Text(description, style: ChronosTypography.bodySmall.copyWith(color: ChronosColors.textSecondary)),
        ],
      ),
    );
  }
}
