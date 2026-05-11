import 'package:equatable/equatable.dart';

enum UserRole { teacher, student, admin }

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String name;
  final UserRole role;
  final String? phone;
  final String? profileImage;
  final DateTime createdAt;

  const UserEntity({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.profileImage,
    required this.createdAt,
  });

  bool get isTeacher => role == UserRole.teacher;
  bool get isStudent => role == UserRole.student;
  bool get isAdmin => role == UserRole.admin;

  @override
  List<Object?> get props => [id, email, name, role, phone, profileImage, createdAt];
}