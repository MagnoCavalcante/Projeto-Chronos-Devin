/// Modelo de perfil do usuário no CHRONOS.
///
/// Reflete a tabela `public.profiles` do Supabase, vinculada ao `auth.users`.
class Profile {
  final String id;
  final String? email;
  final bool isPremium;
  final DateTime createdAt;

  const Profile({
    required this.id,
    this.email,
    required this.isPremium,
    required this.createdAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      email: json['email'] as String?,
      isPremium: (json['is_premium'] as bool?) ?? false,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Profile copyWith({
    String? id,
    String? email,
    bool? isPremium,
    DateTime? createdAt,
  }) {
    return Profile(
      id: id ?? this.id,
      email: email ?? this.email,
      isPremium: isPremium ?? this.isPremium,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
