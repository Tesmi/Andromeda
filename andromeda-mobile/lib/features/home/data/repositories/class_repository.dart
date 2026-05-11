import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/class_model.dart';

class ClassRepository {
  final ApiClient _apiClient;

  ClassRepository(this._apiClient);

  Future<List<ClassModel>> getClassesForTeacher() async {
    final response = await _apiClient.get(ApiConstants.getClasses);
    final data = response.data;
    if (data['status'] == 'success') {
      final classes = data['data']?['classes'] as List<dynamic>? ?? data['classes'] as List<dynamic>? ?? [];
      return classes.map((e) => ClassModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<List<ClassModel>> getClassesForStudent() async {
    final response = await _apiClient.get(ApiConstants.getClasses);
    final data = response.data;
    if (data['status'] == 'success') {
      final classes = data['data']?['classes'] as List<dynamic>? ?? data['classes'] as List<dynamic>? ?? [];
      return classes.map((e) => ClassModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<ClassModel> createClass(String className, String classCode) async {
    final response = await _apiClient.post(
      ApiConstants.createClass,
      data: {
        'className': className,
        'classCode': classCode,
      },
    );
    final data = response.data;
    if (data['status'] == 'success') {
      return ClassModel(
        id: data['data']?['classId']?.toString(),
        className: className,
        classCode: classCode,
        teacherName: '',
        students: [],
      );
    }
    throw Exception(data['msg'] ?? 'Failed to create class');
  }

  Future<void> joinClass(String classCode) async {
    final response = await _apiClient.post(
      ApiConstants.joinClass,
      data: {'classCode': classCode},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to join class');
    }
  }

  Future<void> updateClass(String classId, String className) async {
    final response = await _apiClient.put(
      ApiConstants.updateClass,
      data: {
        'classId': classId,
        'className': className,
      },
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to update class');
    }
  }

  Future<void> deleteClass(String classId) async {
    final response = await _apiClient.delete(
      ApiConstants.deleteClass,
      data: {'classId': classId},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to delete class');
    }
  }
}