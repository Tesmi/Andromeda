import 'dart:io';

class ApiConstants {
  ApiConstants._();

  // Base URL - Platform-aware for mobile development
  // iOS Simulator: localhost works
  // Android Emulator: automatically uses 10.0.2.2 to reach host machine
  // Physical device: use your computer's IP (e.g., 192.168.1.x)
  // To override: pass --dart-define=API_IP=192.168.1.x when running
  static String get baseUrl {
    // Check for manual override (for physical device testing)
    const customIp = String.fromEnvironment('API_IP', defaultValue: '');
    if (customIp.isNotEmpty) {
      return 'http://$customIp:4200';
    }

    // Auto-detect Android emulator - uses 10.0.2.2 to reach host machine
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:4200';
    }

    // iOS simulator and other platforms use localhost
    return 'http://localhost:4200';
  }

  // Auth Endpoints
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String logout = '/api/auth/logout';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String changePassword = '/api/auth/change-password';
  static const String refreshToken = '/api/auth/refresh-token';

  // User Endpoints
  static const String getProfile = '/api/user/profile';
  static const String updateProfile = '/api/user/update-profile';
  static const String getAllUsers = '/api/user/all';
  static const String deleteUser = '/api/user/delete';

  // Class Endpoints
  static const String getClasses = '/api/class/all';
  static const String createClass = '/api/class/create';
  static const String updateClass = '/api/class/update';
  static const String deleteClass = '/api/class/delete';
  static const String joinClass = '/api/class/join';

  // File Endpoints
  static const String getFiles = '/api/file/all';
  static const String uploadFile = '/api/file/upload';
  static const String deleteFile = '/api/file/delete';
  static const String downloadFile = '/api/file/download';
  static const String getRecycleBin = '/api/file/recycle-bin';
  static const String restoreFile = '/api/file/restore';

  // Schedule Endpoints
  static const String getSchedules = '/api/schedule/all';
  static const String createSchedule = '/api/schedule/create';
  static const String updateSchedule = '/api/schedule/update';
  static const String deleteSchedule = '/api/schedule/delete';

  // Notification Endpoints
  static const String getNotifications = '/api/notification/all';
  static const String createNotification = '/api/notification/create';
  static const String markAsRead = '/api/notification/read';
  static const String deleteNotification = '/api/notification/delete';

  // API Key Endpoints (Admin)
  static const String getApiKeys = '/api/key/all';
  static const String createApiKey = '/api/key/create';
  static const String deleteApiKey = '/api/key/delete';

  // Dashboard Endpoints (Admin)
  static const String getDashboardStats = '/api/dashboard/stats';

  // Timeouts
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;
}