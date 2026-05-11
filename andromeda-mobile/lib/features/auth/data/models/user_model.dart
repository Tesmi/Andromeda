import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.name,
    required super.role,
    super.phone,
    super.profileImage,
    required super.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['createdAt'] != null) {
      try {
        parsedDate = DateTime.parse(json['createdAt'].toString());
      } catch (_) {
        parsedDate = DateTime.now();
      }
    }
    return UserModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? json['user']?['id']?.toString() ?? '',
      email: json['email']?.toString() ?? json['user']?['email']?.toString() ?? '',
      name: json['name']?.toString() ?? json['user']?['name']?.toString() ?? '',
      role: _parseRole(json['role']?.toString() ?? json['user']?['role']?.toString()),
      phone: json['phone']?.toString(),
      profileImage: json['profileImage']?.toString() ?? json['profile_image']?.toString(),
      createdAt: parsedDate ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role.name,
      'phone': phone,
      'profileImage': profileImage,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  static UserRole _parseRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'teacher':
        return UserRole.teacher;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.student;
    }
  }
}