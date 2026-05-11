import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_storage.dart';
import 'core/storage/local_storage.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/home/data/repositories/class_repository.dart';
import 'features/schedule/data/repositories/schedule_repository.dart';
import 'features/notifications/data/repositories/notification_repository.dart';
import 'features/files/data/repositories/file_repository.dart';

final getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(sharedPreferences);

  // Core services
  getIt.registerSingleton<SecureStorage>(
    SecureStorage(getIt<SharedPreferences>()),
  );
  getIt.registerSingleton<LocalStorage>(
    LocalStorage(getIt<SharedPreferences>()),
  );
  getIt.registerSingleton<ApiClient>(
    ApiClient(getIt<SecureStorage>()),
  );

  // Repositories
  getIt.registerSingleton<AuthRepository>(
    AuthRepositoryImpl(
      getIt<ApiClient>(),
      getIt<SecureStorage>(),
    ),
  );

  getIt.registerSingleton<ClassRepository>(
    ClassRepository(getIt<ApiClient>()),
  );

  getIt.registerSingleton<ScheduleRepository>(
    ScheduleRepository(getIt<ApiClient>()),
  );

  getIt.registerSingleton<NotificationRepository>(
    NotificationRepository(getIt<ApiClient>()),
  );

  getIt.registerSingleton<FileRepository>(
    FileRepository(getIt<ApiClient>()),
  );

  // BLoCs
  getIt.registerSingleton<AuthBloc>(
    AuthBloc(getIt<AuthRepository>()),
  );
}