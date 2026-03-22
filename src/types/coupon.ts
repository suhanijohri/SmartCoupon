export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT';

export type CouponCategory = 'Food' | 'Shopping' | 'Travel' | 'Electronics' | 'Lifestyle';

export interface Coupon {
  id: string;
  brand: string;
  couponCode: string;
  discountValue: number;
  discountType: DiscountType;
  expiryDate?: string;
  category: CouponCategory;
  source: 'SMS' | 'Internet';
  description?: string;
  isBest?: boolean;
  isExpiringSoon?: boolean;
}

export const CATEGORIES: CouponCategory[] = ['Food', 'Shopping', 'Travel', 'Electronics', 'Lifestyle'];