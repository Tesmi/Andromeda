class ClassModel {
  final String? id;
  final String className;
  final String classCode;
  final String teacherName;
  final List<String> students;
  final DateTime? createdAt;

  ClassModel({
    this.id,
    required this.className,
    required this.classCode,
    required this.teacherName,
    required this.students,
    this.createdAt,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) {
    return ClassModel(
      id: json['_id']?.toString() ?? json['id']?.toString(),
      className: json['ClassName']?.toString() ?? json['className']?.toString() ?? '',
      classCode: json['ClassCode']?.toString() ?? json['classCode']?.toString() ?? '',
      teacherName: json['TeacherName']?.toString() ?? json['teacherName']?.toString() ?? '',
      students: (json['Students'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          (json['students'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'className': className,
      'classCode': classCode,
    };
  }
}