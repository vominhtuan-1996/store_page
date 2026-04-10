import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 1,
        title: const Text(
          'Thông báo',
          style: TextStyle(color: AppColors.black, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: AppColors.primary),
            onPressed: () {}, // Đánh dấu đã đọc tất cả
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: ListView.separated(
              itemCount: 10,
              separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.neutral),
              itemBuilder: (context, index) {
                return _buildNotificationItem(index);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.white,
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Tìm kiếm thông báo...',
          prefixIcon: const Icon(Icons.search, color: AppColors.neutral),
          filled: true,
          fillColor: AppColors.background,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
        ),
      ),
    );
  }

  Widget _buildNotificationItem(int index) {
    final isUnread = index < 2;
    return Container(
      padding: const EdgeInsets.all(16),
      color: isUnread ? AppColors.primary.withOpacity(0.05) : AppColors.white,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: isUnread ? AppColors.primary : AppColors.neutral,
            radius: 20,
            child: Icon(
              isUnread ? Icons.notifications_active : Icons.notifications_none,
              color: AppColors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Hệ thống thông báo',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
                    ),
                    Text(
                      '10:30 AM',
                      style: TextStyle(color: AppColors.greyText.withOpacity(0.7), fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Bạn vừa nhận được một yêu cầu nghiệm thu mới tại khu vực Quận 1.',
                  style: TextStyle(fontSize: 14, color: AppColors.black, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
