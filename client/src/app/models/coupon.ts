export interface Coupon {
    id: number;
    productId: number;
    discountValue: number;
    discountUnit: number;
    dateCreated: Date;
    validUntil: Date;
    couponCode: string;
    minimumOrderValue: number;
    maximumDiscountAmount: number;
    isActive: boolean;
}