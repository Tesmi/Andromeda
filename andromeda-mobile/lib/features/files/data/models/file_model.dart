class FileModel {
  final String? id;
  final String fileName;
  final String filePath;
  final int fileSize;
  final String fileType;
  final String uploadedBy;
  final String className;
  final DateTime? createdAt;

  FileModel({
    this.id,
    required this.fileName,
    required this.filePath,
    required this.fileSize,
    required this.fileType,
    required this.uploadedBy,
    required this.className,
    this.createdAt,
  });

  factory FileModel.fromJson(Map<String, dynamic> json) {
    return FileModel(
      id: json['_id']?.toString() ?? json['id']?.toString(),
      fileName: json['FileName']?.toString() ?? json['fileName']?.toString() ?? '',
      filePath: json['FilePath']?.toString() ?? json['filePath']?.toString() ?? '',
      fileSize: json['FileSize'] as int? ?? json['fileSize'] as int? ?? 0,
      fileType: json['FileType']?.toString() ?? json['fileType']?.toString() ?? '',
      uploadedBy: json['UploadedBy']?.toString() ?? json['uploadedBy']?.toString() ?? '',
      className: json['ClassName']?.toString() ?? json['className']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  Map<String, dynamic> toJson() {
    return {
      'fileName': fileName,
      'className': className,
    };
  }
}