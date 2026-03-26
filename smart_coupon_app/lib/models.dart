class Coupon {
  final String code;
  final String description;
  final String discount;
  final String brand;

  Coupon({
    required this.code,
    required this.description,
    required this.discount,
    required this.brand,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      code: json['code'] ?? '',
      description: json['description'] ?? '',
      discount: json['discount'] ?? '',
      brand: json['brand'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'description': description,
      'discount': discount,
      'brand': brand,
    };
  }
}
