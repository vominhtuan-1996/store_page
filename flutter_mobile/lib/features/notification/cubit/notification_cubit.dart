import 'package:flutter_bloc/flutter_bloc.dart';

// State definition
abstract class NotificationState {}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationLoaded extends NotificationState {
  final List<dynamic> notifications;
  NotificationLoaded(this.notifications);
}

class NotificationError extends NotificationState {
  final String message;
  NotificationError(this.message);
}

// Cubit implementation
class NotificationCubit extends Cubit<NotificationState> {
  NotificationCubit() : super(NotificationInitial());

  Future<void> fetchNotifications() async {
    emit(NotificationLoading());
    try {
      // Giả lập gọi API
      await Future.delayed(const Duration(seconds: 1));
      final sampleData = List.generate(10, (index) => {
        'id': index,
        'title': 'Thông báo số ${index + 1}',
        'content': 'Nội dung chi tiết của thông báo này...',
        'isRead': index > 2,
      });
      emit(NotificationLoaded(sampleData));
    } catch (e) {
      emit(NotificationError('Không thể tải thông báo'));
    }
  }

  void markAsRead(int id) {
    if (state is NotificationLoaded) {
      final currentList = (state as NotificationLoaded).notifications;
      final newList = currentList.map((n) {
        if (n['id'] == id) return {...n, 'isRead': true};
        return n;
      }).toList();
      emit(NotificationLoaded(newList));
    }
  }
}
