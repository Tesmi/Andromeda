import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/file_model.dart';

class FileRepository {
  final ApiClient _apiClient;

  FileRepository(this._apiClient);

  Future<List<FileModel>> getFiles() async {
    final response = await _apiClient.get(ApiConstants.getFiles);
    final data = response.data;
    if (data['status'] == 'success') {
      final files = data['data']?['files'] as List<dynamic>? ?? data['files'] as List<dynamic>? ?? [];
      return files.map((e) => FileModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<FileModel> uploadFile(String filePath, String fileName, {String? className}) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
      if (className != null) 'className': className,
    });

    final response = await _apiClient.uploadFile(
      ApiConstants.uploadFile,
      formData: formData,
    );
    final data = response.data;
    if (data['status'] == 'success') {
      return FileModel(
        id: data['data']?['fileId']?.toString(),
        fileName: data['data']?['fileName']?.toString() ?? fileName,
        filePath: data['data']?['filePath']?.toString() ?? '',
        fileSize: 0,
        fileType: '',
        uploadedBy: '',
        className: className ?? '',
      );
    }
    throw Exception(data['msg'] ?? 'Failed to upload file');
  }

  Future<void> deleteFile(String fileId) async {
    final response = await _apiClient.delete(
      ApiConstants.deleteFile,
      data: {'fileId': fileId},
    );
    final data = response.data;
    if (data['status'] != 'success') {
      throw Exception(data['msg'] ?? 'Failed to delete file');
    }
  }

  Future<void> downloadFile(String fileId, String savePath) async {
    await _apiClient.downloadFile(
      '${ApiConstants.baseUrl}${ApiConstants.downloadFile}?fileId=$fileId',
      savePath,
    );
  }
}