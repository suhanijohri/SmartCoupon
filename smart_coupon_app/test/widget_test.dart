import 'package:flutter_test/flutter_test.dart';
import 'package:smart_coupon_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const SmartCouponApp());

    // Verify that the dashboard is shown.
    expect(find.text('SmartCoupon'), findsWidgets);
  });
}
