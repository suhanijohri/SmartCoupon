import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';

/// Handles local persistence of extracted coupons and the last-scan timestamp.
class StorageService {
  static const _couponsKey = 'saved_coupons';
  static const _lastScanDateKey = 'last_scan_date_ms';

  /// Loads saved coupons from local storage. Returns [] if none saved yet.
  Future<List<Coupon>> loadCoupons() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_couponsKey);
    if (jsonStr == null) return [];
    try {
      final List<dynamic> list = jsonDecode(jsonStr);
      return list.map((e) => Coupon.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  /// Saves the full list of coupons to local storage.
  Future<void> saveCoupons(List<Coupon> coupons) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = jsonEncode(coupons.map((c) => c.toJson()).toList());
    await prefs.setString(_couponsKey, jsonStr);
  }

  /// Returns the DateTime of the last completed scan, or null if never scanned.
  Future<DateTime?> getLastScanDate() async {
    final prefs = await SharedPreferences.getInstance();
    final ms = prefs.getInt(_lastScanDateKey);
    if (ms == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  /// Saves the current time as the last-scan timestamp.
  Future<void> saveLastScanDate(DateTime date) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_lastScanDateKey, date.millisecondsSinceEpoch);
  }

  /// Clears all saved coupons and the scan timestamp (for a full re-scan).
  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_couponsKey);
    await prefs.remove(_lastScanDateKey);
  }
}
