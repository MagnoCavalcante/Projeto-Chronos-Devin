import 'package:flutter/material.dart';
import '../../core/presentation/widgets/widgets.dart';
import '../../core/theme/chronos_colors.dart';
import '../../core/theme/chronos_spacing.dart';
import '../../core/theme/chronos_typography.dart';
import '../models/history_card.dart';

/// Card de Dossiê com 6 abas: Resumo, Fatos, Interpretações, Linha do Tempo,
/// Personagens e Fontes. Inclui o fluxo de gamificação (XP + Concluir).
class DossierCard extends StatefulWidget {
  final HistoryCard card;
  final bool isMastered;
  final int xpReward;
  final VoidCallback? onMaster;
  final VoidCallback? onSave;

  const DossierCard({
    super.key,
    required this.card,
    this.isMastered = false,
    this.xpReward = 30,
    this.onMaster,
    this.onSave,
  });

  @override
  State<DossierCard> createState() => _DossierCardState();
}

enum _DossierTab { resumo, fatos, interpretacoes, linha, personagens, fontes }

class _DossierCardState extends State<DossierCard> with SingleTickerProviderStateMixin {
  _DossierTab _activeTab = _DossierTab.resumo;
  bool _isSaved = false;

  late final _tabs = <_DossierTab, String>{
    _DossierTab.resumo: 'Resumo',
    _DossierTab.fatos: 'Fatos',
    _DossierTab.interpretacoes: 'Interpretações',
    _DossierTab.linha: 'Linha do Tempo',
    _DossierTab.personagens: 'Personagens',
    _DossierTab.fontes: 'Fontes',
  };

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      color: ChronosColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const Divider(color: ChronosColors.border, height: 1),
          _buildTabBar(),
          _buildTabContent(),
          const Divider(color: ChronosColors.border, height: 1),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: ChronosSpacing.edgeInsetsAllLG,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _EvidenceBadge(level: widget.card.evidenceLevel),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 12,
                    color: ChronosColors.textMuted,
                  ),
                  ChronosSpacing.hSizedBoxXS,
                  Text(
                    widget.card.era,
                    style: ChronosTypography.codeSmall,
                  ),
                ],
              ),
            ],
          ),
          ChronosSpacing.vSizedBoxSM,
          Text(
            widget.card.title,
            style: ChronosTypography.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Padding(
        padding: ChronosSpacing.edgeInsetsAllSM,
        child: Row(
          children: _tabs.entries.map((entry) {
            final isSelected = _activeTab == entry.key;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Material(
                color: isSelected ? ChronosColors.surfaceLight : ChronosColors.transparent,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: () => setState(() => _activeTab = entry.key),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: ChronosSpacing.md,
                      vertical: ChronosSpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: isSelected ? ChronosColors.accent : ChronosColors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Text(
                      entry.value,
                      style: ChronosTypography.labelSmall.copyWith(
                        color: isSelected ? ChronosColors.accent : ChronosColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    return AnimatedSize(
      duration: const Duration(milliseconds: 250),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: _buildContentForTab(_activeTab),
      ),
    );
  }

  Widget _buildContentForTab(_DossierTab tab) {
    switch (tab) {
      case _DossierTab.resumo:
        return _buildResumo();
      case _DossierTab.fatos:
        return _buildFatos();
      case _DossierTab.interpretacoes:
        return _buildInterpretacoes();
      case _DossierTab.linha:
        return _buildLinhaDoTempo();
      case _DossierTab.personagens:
        return _buildPersonagens();
      case _DossierTab.fontes:
        return _buildFontes();
    }
  }

  Widget _buildResumo() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.card.summary,
            style: ChronosTypography.bodyLarge.copyWith(
              color: ChronosColors.textPrimary,
            ),
          ),
          ChronosSpacing.vSizedBoxMD,
          Container(
            padding: ChronosSpacing.edgeInsetsAllMD,
            decoration: BoxDecoration(
              color: ChronosColors.surfaceLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Abordagem: cruzamento de dados arqueológicos e fontes textuais contemporâneas.',
              style: ChronosTypography.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFatos() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(icon: Icons.school_outlined, label: 'Consenso Histórico e Arqueológico'),
          if (widget.card.fact.causaImediata != null) ...[
            _FactBox(
              icon: Icons.flash_on_outlined,
              title: 'Causa Imediata',
              color: ChronosColors.warning,
              description: widget.card.fact.causaImediata!,
            ),
            ChronosSpacing.vSizedBoxMD,
          ],
          if (widget.card.fact.desenvolvimento != null) ...[
            _FactBox(
              icon: Icons.format_list_numbered_outlined,
              title: 'Desenvolvimento',
              color: ChronosColors.textPrimary,
              description: widget.card.fact.desenvolvimento!,
            ),
            ChronosSpacing.vSizedBoxMD,
          ],
          if (widget.card.fact.consequencias != null) ...[
            _FactBox(
              icon: Icons.public_outlined,
              title: 'Consequências',
              color: ChronosColors.success,
              description: widget.card.fact.consequencias!,
            ),
            ChronosSpacing.vSizedBoxMD,
          ],
          if (widget.card.fact.causaImediata == null)
            Text(
              widget.card.fact.description,
              style: ChronosTypography.bodyMedium,
            ),
        ],
      ),
    );
  }

  Widget _buildInterpretacoes() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(icon: Icons.format_quote_outlined, label: 'Leituras Historiográficas'),
          Text(
            widget.card.interpretation.description,
            style: ChronosTypography.bodyMedium,
          ),
          if (widget.card.hypothesis.description?.isNotEmpty ?? false) ...[
            ChronosSpacing.vSizedBoxLG,
            Text(
              'Hipóteses Acadêmicas Atuais'.toUpperCase(),
              style: ChronosTypography.labelSmall.copyWith(
                color: ChronosColors.textMuted,
              ),
            ),
            ChronosSpacing.vSizedBoxXS,
            Text(
              widget.card.hypothesis.description!,
              style: ChronosTypography.bodySmall.copyWith(
                color: ChronosColors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLinhaDoTempo() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(icon: Icons.access_time_outlined, label: 'Linha de Evidências'),
          if (widget.card.timeline.isEmpty)
            Text(
              'Cronograma de eventos em catalogação.',
              style: ChronosTypography.bodySmall,
            )
          else
            Column(
              children: widget.card.timeline.asMap().entries.map((entry) {
                return _TimelineItem(
                  year: entry.value.year,
                  event: entry.value.event,
                  isLast: entry.key == widget.card.timeline.length - 1,
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildPersonagens() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(icon: Icons.people_outline_outlined, label: 'Agentes Históricos'),
          if (widget.card.characters.isEmpty)
            Text(
              'Personagens proeminentes em catalogação documental.',
              style: ChronosTypography.bodySmall,
            )
          else
            Column(
              children: widget.card.characters.map((char) {
                return ChronosCard(
                  color: ChronosColors.surfaceLight,
                  margin: const EdgeInsets.only(bottom: ChronosSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        char.name,
                        style: ChronosTypography.titleSmall,
                      ),
                      Text(
                        char.role.toUpperCase(),
                        style: ChronosTypography.labelSmall.copyWith(
                          color: ChronosColors.textMuted,
                        ),
                      ),
                      ChronosSpacing.vSizedBoxXS,
                      Text(
                        char.bio,
                        style: ChronosTypography.bodySmall,
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildFontes() {
    return _TabContentWrapper(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(icon: Icons.menu_book_outlined, label: 'Principais Fontes'),
          if (widget.card.sources.isEmpty)
            Text(
              'Fontes em catalogação.',
              style: ChronosTypography.bodySmall,
            )
          else
            Column(
              children: widget.card.sources.map((src) {
                return _SourceItem(source: src);
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Padding(
      padding: ChronosSpacing.edgeInsetsAllLG,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ChronosButton(
            label: 'Como sabemos disso?',
            onPressed: () => _showSourcesSheet(context),
            variant: ChronosButtonVariant.outline,
            icon: Icons.description_outlined,
            customColor: ChronosColors.accent,
          ),
          Row(
            children: [
              Icon(Icons.star, size: 14, color: ChronosColors.accent),
              ChronosSpacing.hSizedBoxXS,
              Text(
                '+${widget.xpReward} XP',
                style: ChronosTypography.labelSmall.copyWith(
                  color: ChronosColors.accent,
                ),
              ),
              ChronosSpacing.hSizedBoxMD,
              if (widget.isMastered)
                ChronosButton(
                  label: 'Concluído',
                  onPressed: null,
                  icon: Icons.check,
                  customColor: ChronosColors.success,
                )
              else
                ChronosButton(
                  label: 'Concluir',
                  onPressed: widget.onMaster,
                  icon: Icons.explore_outlined,
                ),
              ChronosSpacing.hSizedBoxSM,
              IconButton(
                onPressed: () {
                  setState(() => _isSaved = !_isSaved);
                  widget.onSave?.call();
                },
                icon: Icon(
                  _isSaved ? Icons.bookmark : Icons.bookmark_outline,
                  color: _isSaved ? ChronosColors.accent : ChronosColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showSourcesSheet(BuildContext context) {
    if (widget.card.sources.isEmpty) return;
    ChronosBottomSheet.show<void>(
      context,
      isScrollControlled: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Base de Evidências',
            style: ChronosTypography.titleLarge,
          ),
          ChronosSpacing.vSizedBoxSM,
          Text(
            'Documentos originais, livros acadêmicos e achados arqueológicos usados para sintetizar este tema.',
            style: ChronosTypography.bodySmall,
          ),
          ChronosSpacing.vSizedBoxLG,
          ...widget.card.sources.map((src) => _SourceItem(source: src, compact: true)),
        ],
      ),
    );
  }
}

class _TabContentWrapper extends StatelessWidget {
  final Widget child;
  const _TabContentWrapper({required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: ChronosSpacing.edgeInsetsAllLG,
      child: child,
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final IconData icon;
  final String label;
  const _SectionTitle({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: ChronosSpacing.md),
      child: Row(
        children: [
          Icon(icon, size: 16, color: ChronosColors.accent),
          ChronosSpacing.hSizedBoxSM,
          Text(
            label.toUpperCase(),
            style: ChronosTypography.labelSmall.copyWith(
              color: ChronosColors.accent,
            ),
          ),
        ],
      ),
    );
  }
}

class _EvidenceBadge extends StatelessWidget {
  final String level;
  const _EvidenceBadge({required this.level});

  @override
  Widget build(BuildContext context) {
    final style = _levelStyle(level);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: ChronosSpacing.sm,
        vertical: ChronosSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: style.color.withOpacity(0.12),
        border: Border.all(color: style.color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: style.color,
              shape: BoxShape.circle,
            ),
          ),
          ChronosSpacing.hSizedBoxXS,
          Text(
            style.label,
            style: ChronosTypography.labelSmall.copyWith(color: style.color),
          ),
        ],
      ),
    );
  }

  _EvidenceStyle _levelStyle(String level) {
    switch (level) {
      case 'high':
        return _EvidenceStyle(label: 'Alto consenso', color: ChronosColors.success);
      case 'good':
        return _EvidenceStyle(label: 'Boa evidência', color: ChronosColors.warning);
      case 'debate':
        return _EvidenceStyle(label: 'Tema em debate', color: ChronosColors.accent);
      case 'hypothesis':
        return _EvidenceStyle(label: 'Hipótese', color: ChronosColors.error);
      case 'mythological':
        return _EvidenceStyle(label: 'Registro mitológico', color: Colors.purple);
      default:
        return _EvidenceStyle(label: 'Evidência documentada', color: ChronosColors.textSecondary);
    }
  }
}

class _EvidenceStyle {
  final String label;
  final Color color;
  _EvidenceStyle({required this.label, required this.color});
}

class _FactBox extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final String description;
  const _FactBox({
    required this.icon,
    required this.title,
    required this.color,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: ChronosSpacing.edgeInsetsAllMD,
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        border: Border.all(color: color.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              ChronosSpacing.hSizedBoxXS,
              Text(
                title.toUpperCase(),
                style: ChronosTypography.labelSmall.copyWith(color: color),
              ),
            ],
          ),
          ChronosSpacing.vSizedBoxXS,
          Text(
            description,
            style: ChronosTypography.bodyMedium.copyWith(
              color: ChronosColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String year;
  final String event;
  final bool isLast;
  const _TimelineItem({
    required this.year,
    required this.event,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: ChronosColors.accent,
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: ChronosColors.border,
                  ),
                ),
            ],
          ),
          ChronosSpacing.hSizedBoxMD,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  year,
                  style: ChronosTypography.codeMedium.copyWith(
                    color: ChronosColors.accent,
                  ),
                ),
                Text(
                  event,
                  style: ChronosTypography.bodySmall,
                ),
                if (!isLast) ChronosSpacing.vSizedBoxMD,
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SourceItem extends StatelessWidget {
  final Source source;
  final bool compact;
  const _SourceItem({required this.source, this.compact = false});

  @override
  Widget build(BuildContext context) {
    return ChronosCard(
      color: ChronosColors.surfaceLight,
      margin: const EdgeInsets.only(bottom: ChronosSpacing.md),
      padding: compact
          ? ChronosSpacing.edgeInsetsAllSM
          : ChronosSpacing.edgeInsetsAllMD,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: ChronosSpacing.edgeInsetsAllXS,
            decoration: BoxDecoration(
              color: ChronosColors.surface,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              _sourceTypeLabel(source.type).toUpperCase(),
              style: ChronosTypography.codeSmall.copyWith(
                color: ChronosColors.textMuted,
              ),
            ),
          ),
          ChronosSpacing.hSizedBoxSM,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  source.title,
                  style: ChronosTypography.titleSmall,
                ),
                Text(
                  '${source.author} (${source.year}) ${source.details ?? ''}',
                  style: ChronosTypography.bodySmall,
                ),
              ],
            ),
          ),
          if (source.url != null)
            IconButton(
              onPressed: () {},
              icon: const Icon(
                Icons.open_in_new,
                size: 18,
                color: ChronosColors.textMuted,
              ),
            ),
        ],
      ),
    );
  }

  String _sourceTypeLabel(String type) {
    switch (type) {
      case 'book':
        return 'Livro';
      case 'document':
        return 'Manuscrito';
      case 'archaeological':
        return 'Arqueologia';
      case 'article':
        return 'Artigo';
      case 'myth':
        return 'Mito';
      default:
        return 'Fonte';
    }
  }
}
