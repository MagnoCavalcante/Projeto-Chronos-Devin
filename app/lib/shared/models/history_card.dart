/// Modelo unificado de Dossiê Histórico para o ecossistema CHRONOS.
///
/// Espelha a estrutura `HistoryCard` do protótipo web (React/TypeScript),
/// garantindo que a camada de dados seja previsível ao renderizar
/// os componentes móveis de dossiês.
class HistoryCard {
  final String id;
  final String category;
  final String period;
  final String title;
  final String era;
  final String summary;
  final String evidenceLevel;
  final List<TimelineEvent> timeline;
  final List<HistoryCharacter> characters;
  final FactSection fact;
  final InterpretationSection interpretation;
  final HypothesisSection hypothesis;
  final List<Source> sources;

  const HistoryCard({
    required this.id,
    required this.category,
    required this.period,
    required this.title,
    required this.era,
    required this.summary,
    required this.evidenceLevel,
    this.timeline = const [],
    this.characters = const [],
    required this.fact,
    required this.interpretation,
    required this.hypothesis,
    this.sources = const [],
  });

  /// Constrói um [HistoryCard] a partir do JSON retornado pela tabela `dossiers` do Supabase.
  factory HistoryCard.fromJson(Map<String, dynamic> json) {
    return HistoryCard(
      id: json['id'] as String,
      category: json['category'] as String,
      period: json['period'] as String,
      title: json['title'] as String,
      era: json['era'] as String,
      summary: json['summary'] as String,
      evidenceLevel: json['evidence_level'] as String,
      timeline: ((json['timeline'] as List?) ?? const [])
          .map((e) => TimelineEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
      characters: ((json['characters'] as List?) ?? const [])
          .map((e) => HistoryCharacter.fromJson(e as Map<String, dynamic>))
          .toList(),
      fact: FactSection.fromJson(json['fact'] as Map<String, dynamic>),
      interpretation: InterpretationSection.fromJson(json['interpretation'] as Map<String, dynamic>),
      hypothesis: HypothesisSection.fromJson(json['hypothesis'] as Map<String, dynamic>),
      sources: ((json['sources'] as List?) ?? const [])
          .map((e) => Source.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class TimelineEvent {
  final String year;
  final String event;

  const TimelineEvent({required this.year, required this.event});

  factory TimelineEvent.fromJson(Map<String, dynamic> json) {
    return TimelineEvent(
      year: json['year'] as String,
      event: json['event'] as String,
    );
  }
}

class HistoryCharacter {
  final String name;
  final String role;
  final String bio;

  const HistoryCharacter({
    required this.name,
    required this.role,
    required this.bio,
  });

  factory HistoryCharacter.fromJson(Map<String, dynamic> json) {
    return HistoryCharacter(
      name: json['name'] as String,
      role: json['role'] as String,
      bio: json['bio'] as String,
    );
  }
}

class FactSection {
  final String title;
  final String description;
  final String? causaImediata;
  final String? desenvolvimento;
  final String? consequencias;

  const FactSection({
    required this.title,
    required this.description,
    this.causaImediata,
    this.desenvolvimento,
    this.consequencias,
  });

  factory FactSection.fromJson(Map<String, dynamic> json) {
    return FactSection(
      title: json['title'] as String,
      description: json['description'] as String,
      causaImediata: json['causaImediata'] as String?,
      desenvolvimento: json['desenvolvimento'] as String?,
      consequencias: json['consequencias'] as String?,
    );
  }
}

class InterpretationSection {
  final String title;
  final String description;

  const InterpretationSection({
    required this.title,
    required this.description,
  });

  factory InterpretationSection.fromJson(Map<String, dynamic> json) {
    return InterpretationSection(
      title: json['title'] as String,
      description: json['description'] as String,
    );
  }
}

class HypothesisSection {
  final String title;
  final String? description;

  const HypothesisSection({required this.title, this.description});

  factory HypothesisSection.fromJson(Map<String, dynamic> json) {
    return HypothesisSection(
      title: json['title'] as String,
      description: json['description'] as String?,
    );
  }
}

class Source {
  final String id;
  final String title;
  final String author;
  final int year;
  final String type;
  final String? url;
  final String? details;

  const Source({
    required this.id,
    required this.title,
    required this.author,
    required this.year,
    required this.type,
    this.url,
    this.details,
  });

  factory Source.fromJson(Map<String, dynamic> json) {
    return Source(
      id: json['id'] as String,
      title: json['title'] as String,
      author: json['author'] as String,
      year: (json['year'] as num).toInt(),
      type: json['type'] as String,
      url: json['url'] as String?,
      details: json['details'] as String?,
    );
  }
}
