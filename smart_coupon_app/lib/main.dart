import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_key_page.dart';
import 'models.dart';
import 'sms_service.dart';
import 'ai_service.dart';
import 'storage_service.dart';

void main() {
  runApp(const SmartCouponApp());
}

class SmartCouponApp extends StatelessWidget {
  const SmartCouponApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCoupon Flutter',
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF6B00),
          brightness: Brightness.dark,
          primary: const Color(0xFFFF6B00),
          secondary: const Color(0xFFFF3B30),
          surface: const Color(0xFF121212),
          error: const Color(0xFFFF3B30),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF080808),
      ),
      home: const DashboardShell(),
    );
  }
}

class DashboardShell extends StatefulWidget {
  const DashboardShell({super.key});

  @override
  State<DashboardShell> createState() => _DashboardShellState();
}

class _DashboardShellState extends State<DashboardShell> with SingleTickerProviderStateMixin {
  final SmsService _smsService = SmsService();
  final AiService _aiService = AiService();
  final StorageService _storage = StorageService();

  List<Coupon> _allCoupons = [];
  List<Coupon> _filteredCoupons = [];

  bool _isScanning = false;
  String _statusMessage = '';
  DateTime? _lastScanDate;

  int _currentIndex = 0;

  final TextEditingController _searchController = TextEditingController();
  late AnimationController _scannerPulseController;

  @override
  void initState() {
    super.initState();
    _scannerPulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _checkApiKey();
    _loadSavedData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scannerPulseController.dispose();
    super.dispose();
  }

  /// Load saved coupons and last-scan date from disk on startup.
  Future<void> _loadSavedData() async {
    final coupons = await _storage.loadCoupons();
    final lastDate = await _storage.getLastScanDate();
    if (mounted) {
      setState(() {
        _allCoupons = coupons;
        _filteredCoupons = coupons;
        _lastScanDate = lastDate;
        if (coupons.isNotEmpty) {
          _statusMessage = '${coupons.length} saved offers loaded.';
        }
      });
    }
  }

  Future<void> _checkApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    final key = prefs.getString('gemini_api_key');
    if (key == null || key.isEmpty) {
      if (mounted) {
        setState(() {
          _currentIndex = 2; // Route to user tab to ask for API Key
        });
      }
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredCoupons = _allCoupons;
      } else {
        _filteredCoupons = _allCoupons.where((c) {
          return c.brand.toLowerCase().contains(query) ||
                 c.description.toLowerCase().contains(query) ||
                 c.code.toLowerCase().contains(query) ||
                 c.discount.toLowerCase().contains(query);
        }).toList();
      }
    });
  }

  /// [fullRescan] = true clears all saved coupons and scans all 500 messages.
  /// [fullRescan] = false (default) only scans SMS newer than the last scan.
  Future<void> _scanSms({bool fullRescan = false}) async {
    final scanStart = DateTime.now();
    setState(() {
      _currentIndex = 0;
      _isScanning = true;
      _statusMessage = 'Reading local inbox...';
      if (fullRescan) {
        _allCoupons = [];
        _filteredCoupons = [];
      }
    });
    _scannerPulseController.repeat(reverse: true);

    try {
      // Fetch only new messages if we have a previous scan date
      final List messages;
      if (!fullRescan && _lastScanDate != null) {
        messages = await _smsService.fetchSmsSince(_lastScanDate!);
        setState(() {
          _statusMessage = 'Checking ${messages.length} new messages since last scan...';
        });
      } else {
        messages = await _smsService.fetchRecentSms();
        setState(() {
          _statusMessage = 'Found ${messages.length} messages. Filtering...';
        });
      }

      if (messages.isEmpty) {
        setState(() {
          _isScanning = false;
          _statusMessage = '${_allCoupons.length} offers — no new messages since last scan.';
        });
        return;
      }

      // Filter to only promotional messages locally first
      final keywords = ['discount', 'offer', 'code', 'off', '%', 'sale', 'save', 'cashback', 'promo', 'deal', 'free', 'rs.', '₹', 'voucher'];
      final promotional = <String>[];
      for (final msg in messages) {
        if (msg.body != null && msg.body!.length > 15) {
          final lower = msg.body!.toLowerCase();
          if (keywords.any((k) => lower.contains(k))) {
            promotional.add(msg.body!);
          }
        }
      }

      if (promotional.isEmpty) {
        setState(() {
          _isScanning = false;
          _statusMessage = '${_allCoupons.length} offers — no new promo messages found.';
        });
        await _storage.saveLastScanDate(scanStart);
        setState(() => _lastScanDate = scanStart);
        return;
      }

      setState(() {
        _statusMessage = 'Found ${promotional.length} new promo messages. AI scanning...';
      });
      await Future.delayed(const Duration(milliseconds: 300));

      List<Coupon> newCoupons = [];
      const batchSize = 10;
      final totalBatches = (promotional.length / batchSize).ceil();

      for (var b = 0; b < totalBatches; b++) {
        final start = b * batchSize;
        final end = (start + batchSize).clamp(0, promotional.length);
        final batch = promotional.sublist(start, end);

        setState(() {
          _statusMessage = 'AI scanning batch ${b + 1} of $totalBatches...';
        });

        final coupons = await _aiService.extractCouponsFromBatch(batch);
        newCoupons.addAll(coupons);

        if (b < totalBatches - 1) {
          await Future.delayed(const Duration(milliseconds: 300));
        }
      }

      // Merge new coupons into existing saved ones.
      // Only deduplicate when there is a non-empty code that matches the same brand.
      // Coupons without a promo code are never treated as duplicates.
      final merged = List<Coupon>.from(_allCoupons);
      for (final c in newCoupons) {
        final isDupe = c.code.isNotEmpty &&
            merged.any((existing) =>
                existing.code == c.code && existing.brand == c.brand);
        if (!isDupe) merged.add(c);
      }

      // Persist to disk
      await _storage.saveCoupons(merged);
      await _storage.saveLastScanDate(scanStart);

      setState(() {
        _allCoupons = merged;
        _lastScanDate = scanStart;
        _onSearchChanged();
        _isScanning = false;
        _statusMessage = 'Found ${newCoupons.length} new offers! Total: ${merged.length}.';
      });
    } catch (e) {
      setState(() {
        _isScanning = false;
        _statusMessage = 'Scan failed: $e';
      });
    } finally {
      _scannerPulseController.stop();
      _scannerPulseController.reset();
    }
  }

  Widget _buildHomeEmptyState() {
    if (_isScanning) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ScaleTransition(
              scale: Tween(begin: 0.9, end: 1.1).animate(
                CurvedAnimation(parent: _scannerPulseController, curve: Curves.easeInOut),
              ),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withAlpha(50),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.auto_awesome, size: 64, color: Theme.of(context).colorScheme.primary),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              _statusMessage,
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).colorScheme.onSurface.withAlpha(180),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 80, color: Theme.of(context).colorScheme.onSurface.withAlpha(50)),
          const SizedBox(height: 24),
          Text(
            _statusMessage.isNotEmpty ? _statusMessage : 'No Active Offers',
            style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Tap scan to find discounts.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).colorScheme.onSurface.withAlpha(150),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    final theme = Theme.of(context);
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(30),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.auto_awesome_rounded, color: theme.colorScheme.primary, size: 20),
            ),
            const SizedBox(width: 12),
            RichText(
              text: TextSpan(
                style: GoogleFonts.outfit(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
                children: [
                  const TextSpan(text: 'Smart', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'Coupon', style: TextStyle(color: theme.colorScheme.primary)),
                ],
              ),
            ),
          ],
        ),
        centerTitle: false,
        backgroundColor: theme.scaffoldBackgroundColor.withAlpha(200),
        elevation: 0,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          transitionBuilder: (child, animation) => FadeTransition(opacity: animation, child: child),
          child: _allCoupons.isEmpty || _isScanning
              ? _buildHomeEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.only(top: 8, bottom: 100, left: 20, right: 20),
                  itemCount: _allCoupons.length,
                  itemBuilder: (context, index) {
                    final coupon = _allCoupons[index];
                    return _CouponCard(coupon: coupon, index: index);
                  },
                ),
        ),
      ),
      floatingActionButton: AnimatedScale(
        scale: _isScanning ? 0.0 : 1.0,
        duration: const Duration(milliseconds: 300),
        child: GestureDetector(
          onLongPress: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF1A1A1D),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                title: Text('Full Rescan?', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                content: Text('This will clear all saved coupons and re-scan all 500 messages.\n\nYour current ${_allCoupons.length} offers will be removed first.', style: const TextStyle(color: Colors.white70)),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: Text('Full Rescan', style: TextStyle(color: Theme.of(context).colorScheme.secondary)),
                  ),
                ],
              ),
            );
            if (confirm == true) {
              await _storage.clearAll();
              _scanSms(fullRescan: true);
            }
          },
          child: FloatingActionButton.extended(
            onPressed: _scanSms,
            elevation: 4,
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            icon: const Icon(Icons.document_scanner_rounded),
            label: Text(
              _lastScanDate == null ? 'Scan Messages' : 'Scan New',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildSearchTab() {
    final theme = Theme.of(context);
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(30),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.search_rounded, color: theme.colorScheme.primary, size: 20),
            ),
            const SizedBox(width: 12),
            RichText(
              text: TextSpan(
                style: GoogleFonts.outfit(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
                children: [
                  const TextSpan(text: 'Search ', style: TextStyle(color: Colors.white)),
                  TextSpan(text: 'Offers', style: TextStyle(color: theme.colorScheme.primary)),
                ],
              ),
            ),
          ],
        ),
        centerTitle: false,
        backgroundColor: theme.scaffoldBackgroundColor.withAlpha(200),
        elevation: 0,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                decoration: BoxDecoration(
                  color: const Color(0xFF141416),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF6B00).withAlpha(15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    )
                  ],
                  border: Border.all(color: Colors.white.withAlpha(10)),
                ),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search brands, offers, codes...',
                    hintStyle: TextStyle(color: theme.colorScheme.onSurface.withAlpha(100)),
                    prefixIcon: Icon(Icons.search_rounded, color: theme.colorScheme.primary),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  ),
                ),
              ),
            ),
            Expanded(
              child: _filteredCoupons.isEmpty
                  ? Center(
                      child: Text(
                        'No results match your search.',
                        style: TextStyle(color: theme.colorScheme.onSurface.withAlpha(100)),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.only(top: 8, bottom: 20, left: 20, right: 20),
                      itemCount: _filteredCoupons.length,
                      itemBuilder: (context, index) {
                        final coupon = _filteredCoupons[index];
                        return _CouponCard(coupon: coupon, index: 0); // Disable staggered animation for search
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeTab(),
          _buildSearchTab(),
          const ApiKeyPage(), // User Tab
        ],
      ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary);
            }
            return GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.white54);
          }),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) {
            setState(() {
              _currentIndex = idx;
            });
          },
          backgroundColor: const Color(0xFF0F0F0F),
          indicatorColor: Theme.of(context).colorScheme.primary.withAlpha(40),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined, color: Colors.white54),
              selectedIcon: Icon(Icons.home_rounded, color: Color(0xFFFF6B00)),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_outlined, color: Colors.white54),
              selectedIcon: Icon(Icons.search_rounded, color: Color(0xFFFF6B00)),
              label: 'Search',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline, color: Colors.white54),
              selectedIcon: Icon(Icons.person_rounded, color: Color(0xFFFF6B00)),
              label: 'User',
            ),
          ],
        ),
      ),
    );
  }
}

class _CouponCard extends StatelessWidget {
  final Coupon coupon;
  final int index;

  const _CouponCard({required this.coupon, required this.index});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 400 + (index * 100).clamp(0, 600)),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF141416),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(100),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
          ],
          border: Border.all(
            color: Colors.white.withAlpha(12),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      coupon.brand.isNotEmpty ? coupon.brand.toUpperCase() : 'UNKNOWN BRAND',
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                  if (coupon.discount.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.secondary.withAlpha(35),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: theme.colorScheme.secondary.withAlpha(80)),
                      ),
                      child: Text(
                        coupon.discount,
                        style: GoogleFonts.outfit(
                          color: theme.colorScheme.secondary,
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                coupon.description,
                style: const TextStyle(
                  fontSize: 16,
                  height: 1.4,
                  color: Colors.white70,
                ),
              ),
              if (coupon.code.isNotEmpty) ...[
                const SizedBox(height: 20),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A1D),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withAlpha(15),
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.content_copy_rounded, size: 16, color: theme.colorScheme.primary),
                      const SizedBox(width: 8),
                      SelectableText(
                        coupon.code,
                        style: GoogleFonts.firaCode(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
