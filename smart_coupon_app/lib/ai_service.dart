import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';

class AiService {

  Future<String?> _getApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('gemini_api_key');
  }

  /// Extracts coupons from a batch of SMS bodies in a single API call.
  Future<List<Coupon>> extractCouponsFromBatch(List<String> smsBodies) async {
    final apiKey = await _getApiKey();
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception('Gemini API key not found. Please set it in Settings.');
    }

    final model = GenerativeModel(model: 'gemini-2.5-flash', apiKey: apiKey);
    final fallbackModel = GenerativeModel(model: 'gemini-1.5-flash', apiKey: apiKey);

    // Format SMS as numbered list for the AI
    final smsBlock = smsBodies
        .asMap()
        .entries
        .map((e) => '--- SMS ${e.key + 1} ---\n${e.value}')
        .join('\n\n');

    final prompt = '''
You are a discount and coupon extraction parser.
Analyze these ${smsBodies.length} SMS messages and extract ONLY promotional offers, discount codes, or sales from ALL of them.
Return the result strictly as a valid JSON array of objects. Do not include markdown code block formatting.
If no coupon or promotional info is found in any SMS, return an empty array [].
Each object must have the following string keys:
- "code": The discount code (e.g., "SAVE20"). If none, use "".
- "description": Details of the offer (concise, under 20 words).
- "discount": The discount amount or type (e.g., "20% OFF", "Flat ₹200 off").
- "brand": The name of the brand or store offering the discount.

SMS Messages:
$smsBlock
''';

    Future<List<Coupon>> attemptParse(GenerativeModel m) async {
      final response = await m.generateContent([Content.text(prompt)]);
      final resultText = (response.text ?? '').trim();
      var jsonString = resultText;
      final match = RegExp(r'```(?:json)?\s*([\s\S]*?)\s*```').firstMatch(jsonString);
      if (match != null) jsonString = match.group(1)!;
      if (jsonString.isEmpty) return [];
      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList.map((e) => Coupon.fromJson(e)).toList();
    }

    // Retry-with-backoff helper
    Future<List<Coupon>> withRetry(GenerativeModel m, {int maxRetries = 3}) async {
      for (int attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await attemptParse(m);
        } catch (e) {
          final errorMsg = e.toString();
          // Parse retry-after delay from Gemini rate limit errors
          final retryMatch = RegExp(r'retry in (\d+(?:\.\d+)?)s').firstMatch(errorMsg);
          if (retryMatch != null && attempt < maxRetries - 1) {
            final seconds = double.tryParse(retryMatch.group(1)!) ?? 12;
            await Future.delayed(Duration(milliseconds: (seconds * 1000).ceil()));
            continue;
          }
          rethrow;
        }
      }
      return [];
    }

    try {
      try {
        return await withRetry(model);
      } catch (e) {
        // Fallback to gemini-1.5-flash if primary fails
        return await withRetry(fallbackModel);
      }
    } catch (e, st) {
      // ignore: avoid_print
      print('AI batch parsing error: $e');
      // ignore: avoid_print
      print(st);
      return [];
    }
  }
}
