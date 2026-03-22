import { Coupon } from "@/types/coupon";

export const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    brand: "Domino's",
    couponCode: 'PIZZA50',
    discountValue: 50,
    discountType: 'PERCENTAGE',
    expiryDate: '2024-12-31',
    category: 'Food',
    source: 'Internet',
    description: 'Flat 50% off on all large pizzas.',
    isBest: true
  },
  {
    id: '2',
    brand: 'Amazon',
    couponCode: 'SAVE200',
    discountValue: 200,
    discountType: 'FLAT_AMOUNT',
    expiryDate: '2024-05-15',
    category: 'Shopping',
    source: 'SMS',
    description: 'Save ₹200 on orders above ₹1000.',
    isExpiringSoon: true
  },
  {
    id: '3',
    brand: 'Starbucks',
    couponCode: 'COFFEE10',
    discountValue: 10,
    discountType: 'PERCENTAGE',
    expiryDate: '2024-08-20',
    category: 'Food',
    source: 'Internet',
    description: 'Get 10% off on your favorite brew.'
  },
  {
    id: '4',
    brand: 'MakeMyTrip',
    couponCode: 'FLYHIGH',
    discountValue: 1500,
    discountType: 'FLAT_AMOUNT',
    expiryDate: '2024-06-01',
    category: 'Travel',
    source: 'SMS',
    description: 'Get up to ₹1500 off on international flights.'
  },
  {
    id: '5',
    brand: 'Apple',
    couponCode: 'MACBOOK24',
    discountValue: 5,
    discountType: 'PERCENTAGE',
    expiryDate: '2024-11-11',
    category: 'Electronics',
    source: 'Internet',
    description: 'Education discount: 5% off on Macbooks.'
  },
  {
    id: '6',
    brand: 'Nike',
    couponCode: 'RUNFREE',
    discountValue: 30,
    discountType: 'PERCENTAGE',
    expiryDate: '2024-04-30',
    category: 'Lifestyle',
    source: 'Internet',
    description: 'Spring sale: 30% off on running gear.',
    isExpiringSoon: true
  }
];