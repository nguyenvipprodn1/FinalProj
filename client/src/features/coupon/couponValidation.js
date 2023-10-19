import * as yup from 'yup';

export const validationSchema = yup.object({
    productId: yup.number().required(),
    discountValue: yup.number().required(),
    discountUnit: yup.number().required(),
    couponCode: yup.string().required(),
    minimumOrderValue: yup.number().required().min(0),
    maximumDiscountAmount: yup.number().required().min(0),
    validUntil: yup.date()
        .required('Date is required')
        .min(new Date(), 'Date must be future')
})