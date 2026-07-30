/// Modelos de dados para o acervo de Mitologias Mundiais do CHRONOS.
///
/// Espelha a estrutura `MythologyMetadata` do protótipo web (React/TypeScript)
/// em `src/data/mythologyData.ts`.
class Mythology {
  final String id;
  final String name;
  final String region;
  final String era;
  final String pantheon;
  final String creator;
  final String cosmologyDesc;
  final String creationDesc;
  final String? originMap;
  final List<MythDeity> deities;
  final List<MythHero> heroes;
  final List<MythCreature> creatures;
  final List<MythItem> items;
  final List<MythPlace> places;
  final List<String> timeline;
  final List<String> genealogy;
  final List<MythLiterature> literature;
  final List<String> modernInfluence;
  final List<MythSource> sources;
  final List<String> bibliography;

  const Mythology({
    required this.id,
    required this.name,
    required this.region,
    required this.era,
    required this.pantheon,
    required this.creator,
    required this.cosmologyDesc,
    required this.creationDesc,
    this.originMap,
    this.deities = const [],
    this.heroes = const [],
    this.creatures = const [],
    this.items = const [],
    this.places = const [],
    this.timeline = const [],
    this.genealogy = const [],
    this.literature = const [],
    this.modernInfluence = const [],
    this.sources = const [],
    this.bibliography = const [],
  });

  factory Mythology.fromJson(Map<String, dynamic> json) {
    List<String> stringList(String key) =>
        ((json[key] as List?) ?? const []).map((e) => e.toString()).toList();

    return Mythology(
      id: json['id'] as String,
      name: json['name'] as String,
      region: json['region'] as String,
      era: json['era'] as String,
      pantheon: json['pantheon'] as String,
      creator: json['creator'] as String,
      cosmologyDesc: json['cosmology_desc'] as String,
      creationDesc: json['creation_desc'] as String,
      originMap: json['origin_map'] as String?,
      deities: ((json['deities'] as List?) ?? const [])
          .map((e) => MythDeity.fromJson(e as Map<String, dynamic>))
          .toList(),
      heroes: ((json['heroes'] as List?) ?? const [])
          .map((e) => MythHero.fromJson(e as Map<String, dynamic>))
          .toList(),
      creatures: ((json['creatures'] as List?) ?? const [])
          .map((e) => MythCreature.fromJson(e as Map<String, dynamic>))
          .toList(),
      items: ((json['items'] as List?) ?? const [])
          .map((e) => MythItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      places: ((json['places'] as List?) ?? const [])
          .map((e) => MythPlace.fromJson(e as Map<String, dynamic>))
          .toList(),
      timeline: stringList('timeline'),
      genealogy: stringList('genealogy'),
      literature: ((json['literature'] as List?) ?? const [])
          .map((e) => MythLiterature.fromJson(e as Map<String, dynamic>))
          .toList(),
      modernInfluence: stringList('modern_influence'),
      sources: ((json['sources'] as List?) ?? const [])
          .map((e) => MythSource.fromJson(e as Map<String, dynamic>))
          .toList(),
      bibliography: stringList('bibliography'),
    );
  }
}

class MythDeity {
  final String name;
  final String domain;
  final String desc;
  final String symbol;

  const MythDeity({required this.name, required this.domain, required this.desc, required this.symbol});

  factory MythDeity.fromJson(Map<String, dynamic> json) => MythDeity(
        name: json['name'] as String,
        domain: json['domain'] as String,
        desc: json['desc'] as String,
        symbol: json['symbol'] as String,
      );
}

class MythHero {
  final String name;
  final String saga;
  final String bio;

  const MythHero({required this.name, required this.saga, required this.bio});

  factory MythHero.fromJson(Map<String, dynamic> json) => MythHero(
        name: json['name'] as String,
        saga: json['saga'] as String,
        bio: json['bio'] as String,
      );
}

class MythCreature {
  final String name;
  final String desc;
  final String role;

  const MythCreature({required this.name, required this.desc, required this.role});

  factory MythCreature.fromJson(Map<String, dynamic> json) => MythCreature(
        name: json['name'] as String,
        desc: json['desc'] as String,
        role: json['role'] as String,
      );
}

class MythItem {
  final String name;
  final String desc;
  final String power;

  const MythItem({required this.name, required this.desc, required this.power});

  factory MythItem.fromJson(Map<String, dynamic> json) => MythItem(
        name: json['name'] as String,
        desc: json['desc'] as String,
        power: json['power'] as String,
      );
}

class MythPlace {
  final String name;
  final String desc;
  final String nature;

  const MythPlace({required this.name, required this.desc, required this.nature});

  factory MythPlace.fromJson(Map<String, dynamic> json) => MythPlace(
        name: json['name'] as String,
        desc: json['desc'] as String,
        nature: json['nature'] as String,
      );
}

class MythLiterature {
  final String title;
  final String author;
  final String impact;

  const MythLiterature({required this.title, required this.author, required this.impact});

  factory MythLiterature.fromJson(Map<String, dynamic> json) => MythLiterature(
        title: json['title'] as String,
        author: json['author'] as String,
        impact: json['impact'] as String,
      );
}

class MythSource {
  final String title;
  final String author;
  final String year;
  final String type;
  final String details;

  const MythSource({
    required this.title,
    required this.author,
    required this.year,
    required this.type,
    required this.details,
  });

  factory MythSource.fromJson(Map<String, dynamic> json) => MythSource(
        title: json['title'] as String,
        author: json['author'] as String,
        year: json['year'] as String,
        type: json['type'] as String,
        details: json['details'] as String,
      );
}

/// Modelo de uma seção do Folclore Brasileiro (`folklore_entries`).
class FolkloreEntry {
  final String id;
  final String topic;
  final String title;
  final String details;
  final List<String> bullets;
  final String? scientificNote;

  const FolkloreEntry({
    required this.id,
    required this.topic,
    required this.title,
    required this.details,
    this.bullets = const [],
    this.scientificNote,
  });

  factory FolkloreEntry.fromJson(Map<String, dynamic> json) {
    return FolkloreEntry(
      id: json['id'] as String,
      topic: json['topic'] as String,
      title: json['title'] as String,
      details: json['details'] as String,
      bullets: ((json['bullets'] as List?) ?? const []).map((e) => e.toString()).toList(),
      scientificNote: json['scientific_note'] as String?,
    );
  }
}
