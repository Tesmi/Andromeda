import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/auth/presentation/bloc/auth_state.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/auth/presentation/pages/forgot_password_page.dart';
import '../features/home/presentation/pages/teacher_home_page.dart';
import '../features/home/presentation/pages/student_home_page.dart';
import '../features/files/presentation/pages/files_page.dart';
import '../features/schedule/presentation/pages/schedule_page.dart';
import '../features/notifications/presentation/pages/notifications_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/settings/presentation/pages/settings_page.dart';
import '../features/video_call/presentation/pages/video_call_page.dart';

class AppRoutes {
  AppRoutes._();

  // Route names
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String teacherHome = '/teacher-home';
  static const String studentHome = '/student-home';
  static const String files = '/files';
  static const String schedule = '/schedule';
  static const String notifications = '/notifications';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String videoCall = '/video-call';

  // Navigation keys
  static final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();
  static final GlobalKey<NavigatorState> shellNavigatorKey = GlobalKey<NavigatorState>();

  // Router configuration
  static GoRouter router(AuthBloc authBloc) {
    return GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: login,
      debugLogDiagnostics: true,
      redirect: (context, state) {
        final isLoggedIn = authBloc.state is AuthAuthenticated;
        final isAuthRoute = state.matchedLocation == login ||
            state.matchedLocation == register ||
            state.matchedLocation == forgotPassword;

        // If not logged in and not on auth route, redirect to login
        if (!isLoggedIn && !isAuthRoute) {
          return login;
        }

        // If logged in and on auth route, redirect to appropriate home
        if (isLoggedIn && isAuthRoute) {
          final authState = authBloc.state as AuthAuthenticated;
          return authState.user.isTeacher ? teacherHome : studentHome;
        }

        return null;
      },
      refreshListenable: GoRouterRefreshStream(authBloc.stream),
      routes: [
        // Auth routes
        GoRoute(
          path: login,
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: register,
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          path: forgotPassword,
          builder: (context, state) => const ForgotPasswordPage(),
        ),

        // Teacher routes
        GoRoute(
          path: teacherHome,
          builder: (context, state) => const TeacherHomePage(),
        ),

        // Student routes
        GoRoute(
          path: studentHome,
          builder: (context, state) => const StudentHomePage(),
        ),

        // Shared routes
        GoRoute(
          path: files,
          builder: (context, state) => const FilesPage(),
        ),
        GoRoute(
          path: schedule,
          builder: (context, state) => const SchedulePage(),
        ),
        GoRoute(
          path: notifications,
          builder: (context, state) => const NotificationsPage(),
        ),
        GoRoute(
          path: profile,
          builder: (context, state) => const ProfilePage(),
        ),
        GoRoute(
          path: settings,
          builder: (context, state) => const SettingsPage(),
        ),
        GoRoute(
          path: videoCall,
          builder: (context, state) => const VideoCallPage(),
        ),
      ],
    );
  }
}

// GoRouter refresh stream wrapper
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    stream.listen((_) => notifyListeners());
  }
}