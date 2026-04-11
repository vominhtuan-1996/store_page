import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class ScanQrCodeScreen extends StatelessWidget {
  const ScanQrCodeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Quét mã QR',
          style: TextStyle(color: AppColors.black, fontSize: 18, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Placeholder for Camera Preview
          Container(
            color: AppColors.black.withOpacity(0.5),
            child: const Center(
              child: Text(
                'Camera Preview Placeholder',
                style: TextStyle(color: AppColors.white),
              ),
            ),
          ),
          
          // QR Overlay
          const QrOverlayWidget(),

          // Guide Text
          Positioned(
            top: MediaQuery.of(context).size.height * 0.15,
            left: 0,
            right: 0,
            child: const Center(
              child: Text(
                'Di chuyển camera đến vùng chứa mã QR',
                style: TextStyle(color: AppColors.white, fontSize: 14),
              ),
            ),
          ),

          // Bottom Actions
          Positioned(
            bottom: 120,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildActionButton(Icons.highlight, 'Bật Flash'),
                const SizedBox(width: 40),
                _buildActionButton(Icons.image, 'Chọn ảnh'),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.white.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.white, size: 28),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: AppColors.white, fontSize: 12)),
      ],
    );
  }

  Widget _buildBottomNav() {
    return Container(
      height: 70,
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(top: BorderSide(color: AppColors.neutral, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.qr_code, 'Quét mã', isActive: true),
          _buildNavItem(Icons.search, 'Tìm kiếm'),
          _buildNavItem(Icons.history, 'Lịch sử'),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, {bool isActive = false}) {
    final color = isActive ? AppColors.primary : AppColors.neutral;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: color),
        Text(label, style: TextStyle(color: color, fontSize: 10)),
      ],
    );
  }
}

class QrOverlayWidget extends StatelessWidget {
  const QrOverlayWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: QrOverlayPainter(),
      child: Container(),
    );
  }
}

class QrOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..style = PaintingStyle.fill;

    const scanAreaSize = 250.0;
    final rect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: scanAreaSize,
      height: scanAreaSize,
    );

    // Draw background with hole
    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()..addRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12))),
      ),
      paint,
    );

    // Draw borders
    final borderPaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    final borderPath = Path();
    const cornerLength = 20.0;

    // Top left
    borderPath.moveTo(rect.left, rect.top + cornerLength);
    borderPath.lineTo(rect.left, rect.top);
    borderPath.lineTo(rect.left + cornerLength, rect.top);

    // Top right
    borderPath.moveTo(rect.right - cornerLength, rect.top);
    borderPath.lineTo(rect.right, rect.top);
    borderPath.lineTo(rect.right, rect.top + cornerLength);

    // Bottom left
    borderPath.moveTo(rect.left, rect.bottom - cornerLength);
    borderPath.lineTo(rect.left, rect.bottom);
    borderPath.lineTo(rect.left + cornerLength, rect.bottom);

    // Bottom right
    borderPath.moveTo(rect.right - cornerLength, rect.bottom);
    borderPath.lineTo(rect.right, rect.bottom);
    borderPath.lineTo(rect.right, rect.bottom - cornerLength);

    canvas.drawPath(borderPath, borderPaint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
