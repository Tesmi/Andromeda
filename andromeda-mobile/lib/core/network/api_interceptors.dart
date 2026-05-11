import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import 'api_exceptions.dart';

class ApiInterceptors extends Interceptor {
  final SecureStorage _secureStorage;

  ApiInterceptors(this._secureStorage);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) {
    // Add authentication token if available
    final token = _secureStorage.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    // Add content type for form data
    if (options.data is FormData) {
      options.headers['Content-Type'] = 'multipart/form-data';
    }

    handler.next(options);
  }

  @override
  void onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) {
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: NetworkException(
              message: 'Connection timeout. Please try again.',
            ),
          ),
        );
        break;

      case DioExceptionType.connectionError:
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: NetworkException(
              message: 'No internet connection.',
            ),
          ),
        );
        break;

      case DioExceptionType.badResponse:
        _handleBadResponse(err, handler);
        break;

      case DioExceptionType.cancel:
        handler.reject(err);
        break;

      default:
        // Log for debugging
        print('API Error: ${err.type} - ${err.message}');
        print('Response: ${err.response?.data}');
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ApiException(
              message: 'An unexpected error occurred: ${err.message}',
            ),
          ),
        );
    }
  }

  void _handleBadResponse(DioException err, ErrorInterceptorHandler handler) {
    final statusCode = err.response?.statusCode;
    final data = err.response?.data;

    String message;
    switch (statusCode) {
      case 400:
        message = data?['message']
            ?? data?['error']
            ?? data?['errorMessage']
            ?? 'Bad request';
        print('Debug 400 - Response: $data');
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ValidationException(message: message),
          ),
        );
        break;
      case 401:
        message = data?['message'] ?? 'Unauthorized';
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: UnauthorizedException(message: message),
          ),
        );
        break;
      case 403:
        message = data?['message'] ?? 'Forbidden';
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ApiException(message: message, statusCode: 403),
          ),
        );
        break;
      case 404:
        message = data?['message'] ?? 'Not found';
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ApiException(message: message, statusCode: 404),
          ),
        );
        break;
      case 500:
        message = data?['message'] ?? 'Server error';
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ServerException(message: message, statusCode: 500),
          ),
        );
        break;
      default:
        // Try multiple common response structures
        message = data?['message']
            ?? data?['error']
            ?? data?['errorMessage']
            ?? data?['msg']
            ?? 'Something went wrong';
        // Debug: print the actual response
        print('Debug - Status: $statusCode, Response: $data');
        handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            error: ApiException(message: message, statusCode: statusCode),
          ),
        );
    }
  }
}