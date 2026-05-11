import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/schedule_model.dart';

class ScheduleRepository {
  final ApiClient _apiClient;

  ScheduleRepository(this._apiClient);

  Future<List<ScheduleModel>> getSchedules() async {
    final response = await _apiClient.get(ApiConstants.getSchedules);
    final data = response.data;
    if (data['status'] == 'success') {
      final schedules = data['data']?['schedules'] as List<dynamic>? ?? data['schedules'] as List<dynamic>? ?? [];
      return schedules.map((e) => ScheduleModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<ScheduleModel> createSchedule({
    required String className,
    required String start,
    required String end,
    required String topic,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.createSchedule,
      data: {
        'className': className,
        'start': start,
        'end': end,
        'topic': topic,
      },
    );
    final data = response.data;
    if (data['status'] == 'success') {
      return ScheduleModel(
        id: data['data']?['scheduleId']?.toString(),
        className: className,
        teacherName: '',
        start: start,
        end: end,
        topic: topic,
      );
    }
    throw Exception(data['msg'] ?? 'Failed to create schedule');
  }

  Future<void> updateSchedule({
    required String scheduleId,
    String? className,
    String? start,
    String? end,
    String? topic,
  }) async {
    final response = await _apiClient.put(
      ApiConstants.updateSchedule,
      data: {
        'scheduleId': scheduleId,
        if (className != null) 'className': className,
        if (start != null) 'start': start,
        if (end != null) 'end': end,
        if (topic != null) 'topic': topic,
      },
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to update schedule');
    }
  }

  Future<void> deleteSchedule(String scheduleId) async {
    final response = await _apiClient.delete(
      ApiConstants.deleteSchedule,
      data: {'scheduleId': scheduleId},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to delete schedule');
    }
  }
}