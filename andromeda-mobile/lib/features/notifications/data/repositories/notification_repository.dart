import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<List<NotificationModel>> getNotifications() async {
    final response = await _apiClient.get(ApiConstants.getNotifications);
    final data = response.data;
    if (data['status'] == 'success') {
      final notifications = data['data']?['notifications'] as List<dynamic>? ?? data['notifications'] as List<dynamic>? ?? [];
      return notifications.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<NotificationModel> createNotification({
    required String title,
    required String description,
    String? className,
    String? createdFor,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.createNotification,
      data: {
        'title': title,
        'description': description,
        if (className != null) 'className': className,
        if (createdFor != null) 'createdFor': createdFor,
      },
    );
    final data = response.data;
    if (data['status'] == 'success') {
      return NotificationModel(
        id: data['data']?['notificationId']?.toString(),
        title: title,
        description: description,
        createdBy: '',
        className: className ?? '',
        createdFor: createdFor ?? '',
        isRead: false,
      );
    }
    throw Exception(data['msg'] ?? 'Failed to create notification');
  }

  Future<void> markAsRead(String notificationId) async {
    final response = await _apiClient.post(
      ApiConstants.markAsRead,
      data: {'notificationId': notificationId},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to mark notification as read');
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    final response = await _apiClient.delete(
      ApiConstants.deleteNotification,
      data: {'notificationId': notificationId},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to delete notification');
    }
  }
}