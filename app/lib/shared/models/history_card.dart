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
}

class TimelineEvent {
  final String year;
  final String event;

  const TimelineEvent({required this.year, required this.event});
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
}

class InterpretationSection {
  final String title;
  final String description;

  const InterpretationSection({
    required this.title,
    required this.description,
  });
}

class HypothesisSection {
  final String title;
  final String? description;

  const HypothesisSection({required this.title, this.description});
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
}
