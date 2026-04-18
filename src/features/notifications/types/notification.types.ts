/**
 * Notification type definitions for the Al-Maslamani app.
 *
 * Covers three categories:
 *  - offer        → New offers & discounts
 *  - discount_code → Promo / coupon codes
 *  - order_update  → Order-status changes
 */

export type NotificationType = 'offer' | 'discount_code' | 'order_update';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Optional image URL (e.g. product image, promo banner). */
  imageUrl?: string | null;
  /** For order updates – the related order id. */
  orderId?: string | null;
  /** For discount codes – the actual code. */
  discountCode?: string | null;
  /** Percentage or fixed value of a discount (display only). */
  discountValue?: string | null;
  isRead: boolean;
  createdAt: string; // ISO-8601
};
