import 'package:flutter_sms_inbox/flutter_sms_inbox.dart';
import 'package:permission_handler/permission_handler.dart';

class SmsService {
  final SmsQuery _query = SmsQuery();

  Future<bool> _ensurePermission() async {
    var permission = await Permission.sms.status;
    if (!permission.isGranted) {
      permission = await Permission.sms.request();
    }
    return permission.isGranted;
  }

  /// Fetches up to [count] most recent inbox messages.
  Future<List<SmsMessage>> fetchRecentSms({int count = 500}) async {
    if (!await _ensurePermission()) return [];
    return _query.querySms(kinds: [SmsQueryKind.inbox], count: count);
  }

  /// Fetches only inbox messages received AFTER [since].
  /// Falls back to all recent SMS if date filtering isn't supported.
  Future<List<SmsMessage>> fetchSmsSince(DateTime since) async {
    if (!await _ensurePermission()) return [];
    // flutter_sms_inbox returns messages sorted newest-first.
    // We fetch a large batch and filter locally by date.
    final all = await _query.querySms(kinds: [SmsQueryKind.inbox], count: 500);
    return all.where((m) {
      final date = m.date;
      if (date == null) return false;
      return date.isAfter(since);
    }).toList();
  }
}
