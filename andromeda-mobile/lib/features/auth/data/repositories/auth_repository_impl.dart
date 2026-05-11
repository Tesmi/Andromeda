import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;
  final SecureStorage _secureStorage;

  AuthRepositoryImpl(this._apiClient, this._secureStorage);

  @override
  Future<({UserEntity user, String token, String refreshToken})> login({
    required String email,
    required String password,
    String? fcmToken,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
        if (fcmToken != null) 'fcmToken': fcmToken,
      },
    );

    final loginResponse = response.data;
    final String token = loginResponse['token']?.toString() ?? loginResponse['accessToken']?.toString() ?? '';
    final String refreshToken = loginResponse['refreshToken']?.toString() ?? '';

    // Save tokens
    await _secureStorage.setToken(token);
    await _secureStorage.setRefreshToken(refreshToken);

    final user = UserModel.fromJson(loginResponse['user'] ?? loginResponse);
    await _secureStorage.setUserId(user.id);
    await _secureStorage.setUserRole(user.role.name);

    return (user: user, token: token, refreshToken: refreshToken);
  }

  @override
  Future<({UserEntity user, String token, String refreshToken})> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? phone,
  }) async {
    // Map role to accountType expected by backend
    final accountType = role.toLowerCase();

    final response = await _apiClient.post(
      ApiConstants.register,
      data: {
        'fullname': name,
        'email': email,
        'contact': phone ?? '',
        'gender': 'other', // Default, can be extended
        'accountType': accountType,
        'password': password,
        // Student-specific fields (defaults)
        if (accountType == 'student') ...{
          'grade': '10',
          'board': 'CBSE',
        },
      },
    );

    final registerResponse = response.data;
    final String token = registerResponse['token']?.toString() ?? registerResponse['accessToken']?.toString() ?? '';
    final String refreshToken = registerResponse['refreshToken']?.toString() ?? '';

    // Save tokens if provided
    if (token.isNotEmpty) {
      await _secureStorage.setToken(token);
    }
    if (refreshToken.isNotEmpty) {
      await _secureStorage.setRefreshToken(refreshToken);
    }

    // For registration, we may not get user data back, create from response
    final userData = registerResponse['user'] ?? registerResponse;
    final user = userData is Map<String, dynamic>
        ? UserModel.fromJson(userData)
        : UserEntity(
            id: registerResponse['data']?['username']?.toString() ?? '',
            email: email,
            name: name,
            role: role == 'teacher' ? UserRole.teacher : UserRole.student,
            createdAt: DateTime.now(),
          );
    await _secureStorage.setUserId(user.id);
    await _secureStorage.setUserRole(user.role.name);

    return (user: user, token: token, refreshToken: refreshToken);
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _apiClient.post(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  @override
  Future<({UserEntity user, String token, String refreshToken})> refreshToken(String refreshToken) async {
    final response = await _apiClient.post(
      ApiConstants.refreshToken,
      data: {'refreshToken': refreshToken},
    );

    final tokenResponse = response.data;
    final String newToken = tokenResponse['token']?.toString() ?? tokenResponse['accessToken']?.toString() ?? '';
    final String newRefreshToken = tokenResponse['refreshToken']?.toString() ?? refreshToken;

    await _secureStorage.setToken(newToken);
    await _secureStorage.setRefreshToken(newRefreshToken);

    final user = UserModel.fromJson(tokenResponse['user'] ?? {});

    return (user: user, token: newToken, refreshToken: newRefreshToken);
  }

  @override
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logout);
    } catch (_) {
      // Continue with local logout even if server logout fails
    }
    await _secureStorage.clearAll();
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    if (!isLoggedIn()) return null;

    try {
      final response = await _apiClient.get(ApiConstants.getProfile);
      return UserModel.fromJson(response.data);
    } catch (_) {
      return null;
    }
  }

  @override
  bool isLoggedIn() {
    return _secureStorage.isLoggedIn();
  }
}