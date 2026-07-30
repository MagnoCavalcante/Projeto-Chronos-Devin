import 'package:flutter/material.dart';
import '../../../core/presentation/widgets/widgets.dart';
import '../../../core/theme/chronos_colors.dart';
import '../../../core/theme/chronos_typography.dart';
import '../../../shared/models/history_card.dart';
import '../../../shared/services/dossier_remote_datasource.dart';
import '../../../shared/services/gamification_service.dart';
import '../../../shared/widgets/dossier_card.dart';

/// Tela de Dossiês que demonstra o fluxo de estudo com gamificação.
///
/// Aceita um [card] pré-carregado (ex: vindo da lista de dossiês) ou um [cardId]
/// para buscar o conteúdo diretamente da tabela `dossiers` no Supabase.
class DossierPage extends StatefulWidget {
  final HistoryCard? card;
  final String? cardId;

  const DossierPage({super.key, this.card, this.cardId});

  @override
  State<DossierPage> createState() => _DossierPageState();
}

class _DossierPageState extends State<DossierPage> {
  final GamificationService _gamification = GamificationService();
  final DossierRemoteDataSource _dataSource = DossierRemoteDataSource();

  late Future<HistoryCard> _cardFuture;

  @override
  void initState() {
    super.initState();
    if (widget.card != null) {
      _cardFuture = Future.value(widget.card);
    } else if (widget.cardId != null) {
      _cardFuture = _dataSource.getDossierById(widget.cardId!);
    } else {
      _cardFuture = Future.value(_sampleCard());
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChronosScaffold(
      title: 'Dossiê',
      body: FutureBuilder<HistoryCard>(
        future: _cardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: ChronosLoading(message: 'Carregando dossiê...'));
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Não foi possível carregar este dossiê.\n${snapshot.error ?? ''}',
                  textAlign: TextAlign.center,
                  style: ChronosTypography.bodyMedium.copyWith(color: ChronosColors.textSecondary),
                ),
              ),
            );
          }
          final card = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                DossierCard(
                  card: card,
                  isMastered: _gamification.isMastered(card.id),
                  onMaster: () {
                    final earned = _gamification.masterCard(card.id);
                    if (earned > 0) {
                      setState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('+$earned XP conquistados!'),
                          backgroundColor: ChronosColors.success,
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Total de XP',
          style: ChronosTypography.titleMedium,
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: ChronosColors.accent.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              const Icon(Icons.star, size: 16, color: ChronosColors.accent),
              const SizedBox(width: 4),
              Text(
                '${_gamification.xp} XP',
                style: ChronosTypography.labelMedium.copyWith(
                  color: ChronosColors.accent,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  HistoryCard _sampleCard() {
    return const HistoryCard(
      id: 'sample-001',
      category: 'História Antiga',
      period: 'Antiguidade Oriental',
      title: 'A Invenção da Escrita Cuneiforme',
      era: 'c. 3200 a.C.',
      summary:
          'A transição de fichas contábeis de argila para tabuletas cuneiformes em Uruk. Síntese executiva sobre a necessidade de controle tributário, o mecanismo administrativo da escrita e seu impacto cognitivo e histórico.',
      evidenceLevel: 'high',
      timeline: [
        TimelineEvent(
          year: 'c. 8000–3500 a.C.',
          event: 'Uso de fichas simples de argila (calculi) para contagem de bens e grãos no Crescente Fértil.',
        ),
        TimelineEvent(
          year: 'c. 3400–3200 a.C.',
          event: 'Surgimento das primeiras tabuletas proto-cuneiformes em Uruk.',
        ),
      ],
      characters: [
        HistoryCharacter(
          name: 'Escribas de Uruk',
          role: 'Administradores',
          bio: 'Oficiais encarregados de registrar tributos, contratos e ofertas no templo de Eanna.',
        ),
      ],
      fact: FactSection(
        title: 'O Contexto Urbano em Uruk',
        description:
            'No final do 4º milênio a.C., Uruk experimentou um boom demográfico e administrativo. Os administradores evoluíram de fichas tridimensionais para tabuletas planas marcadas com estiletes de junco.',
        causaImediata: 'A necessidade de controlar grandes colheitas e tributos de rebanhos no templo.',
        desenvolvimento: 'Evolução das bullae e calculi para tabuletas de argila com sinais pictográficos.',
        consequencias: 'Nascimento da escrita como ferramenta de poder, controle e memória institucional.',
      ),
      interpretation: InterpretationSection(
        title: 'Teoria de Denise Schmandt-Besserat',
        description:
            'A arqueóloga demonstrou que os tokens de argila pré-históricos antecedem e originam a escrita cuneiforme, explicando a revolução cognitivo-administrativa do 4º milênio.',
      ),
      hypothesis: HypothesisSection(
        title: 'Escrita ritual antes do administrativo',
        description: 'Alguns estudiosos sugerem que a escrita pode ter começado em contextos religiosos, não apenas contábeis.',
      ),
      sources: [
        Source(
          id: 'src-001',
          title: 'Before Writing, Vol. I',
          author: 'Denise Schmandt-Besserat',
          year: 1992,
          type: 'book',
          details: 'University of Texas Press',
        ),
        Source(
          id: 'src-002',
          title: 'Archaic Bookkeeping',
          author: 'Hans J. Nissen',
          year: 1993,
          type: 'book',
        ),
      ],
    );
  }
}
