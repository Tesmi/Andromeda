import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<({UserEntity user, String token, String refreshToken})> login({
    required String email,
    required String password,
    String? fcmToken,
  });

  Future<({UserEntity user, String token, String refreshToken})> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? phone,
  });

  Future<void> forgotPassword(String email);

  Future<({UserEntity user, String token, String refreshToken})> refreshToken(String refreshToken);

  Future<void> logout();

  Future<UserEntity?> getCurrentUser();

  bool isLoggedIn();
}