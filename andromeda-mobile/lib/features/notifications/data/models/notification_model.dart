class NotificationModel {
  final String? id;
  final String title;
  final String description;
  final String createdBy;
  final String className;
  final String createdFor;
  final bool isRead;
  final DateTime? createdAt;

  NotificationModel({
    this.id,
    required this.title,
    required this.description,
    required this.createdBy,
    required this.className,
    required this.createdFor,
    required this.isRead,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id']?.toString() ?? json['id']?.toString(),
      title: json['Title']?.toString() ?? json['title']?.toString() ?? '',
      description: json['Description']?.toString() ?? json['description']?.toString() ?? '',
      createdBy: json['CreatedBy']?.toString() ?? json['createdBy']?.toString() ?? '',
      className: json['ClassName']?.toString() ?? json['className']?.toString() ?? '',
      createdFor: json['CreatedFor']?.toString() ?? json['createdFor']?.toString() ?? '',
      isRead: json['IsRead'] == true || json['isRead'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'className': className,
      'createdFor': createdFor,
    };
  }
}