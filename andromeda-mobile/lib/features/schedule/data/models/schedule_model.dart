class ScheduleModel {
  final String? id;
  final String className;
  final String teacherName;
  final String start;
  final String end;
  final String topic;
  final DateTime? createdAt;

  ScheduleModel({
    this.id,
    required this.className,
    required this.teacherName,
    required this.start,
    required this.end,
    required this.topic,
    this.createdAt,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['_id']?.toString() ?? json['id']?.toString(),
      className: json['ClassName']?.toString() ?? json['className']?.toString() ?? '',
      teacherName: json['TeacherName']?.toString() ?? json['teacherName']?.toString() ?? '',
      start: json['Start']?.toString() ?? json['start']?.toString() ?? '',
      end: json['End']?.toString() ?? json['end']?.toString() ?? '',
      topic: json['Topic']?.toString() ?? json['topic']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  DateTime? get startDateTime {
    try {
      return DateTime.parse(start);
    } catch (_) {
      return null;
    }
  }

  DateTime? get endDateTime {
    try {
      return DateTime.parse(end);
    } catch (_) {
      return null;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'className': className,
      'start': start,
      'end': end,
      'topic': topic,
    };
  }
}