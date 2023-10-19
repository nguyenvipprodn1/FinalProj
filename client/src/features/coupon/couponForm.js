import {Box, Paper, Typography, Grid, Button, TextField} from "@mui/material";
import React, { useEffect } from "react";
import {Controller, useForm} from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import { yupResolver } from '@hookform/resolvers/yup';
import { validationSchema } from "./couponValidation";
import agent from "../../app/api/agent";
import { LoadingButton } from "@mui/lab";
import AppSelectListKeyId from "../../app/components/AppSelectListKeyId";
import useProducts from "../../app/hooks/useProducts";

export default function CouponForm({ coupon, cancelEdit, getAll }) {
    const { control, reset, handleSubmit, watch, formState: { isDirty, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            validUntil: coupon ? new Date(coupon.validUntil).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        },
    });
    const {products, metaData} = useProducts();

    useEffect(() => {
        if (coupon && !isDirty) reset({
            ...coupon,
            validUntil: coupon.validUntil
                ? new Date(coupon.validUntil).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
        });
    }, [coupon, reset, isDirty])

    async function handleSubmitData(data) {
        try {
            let response;
            if (coupon) {
                response = await agent.Coupon.updateCoupon(coupon.id, data);
            } else {
                response = await agent.Coupon.createCoupon(data);
            }
            getAll();
            cancelEdit();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Box component={Paper} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Coupon Details
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                        <AppTextInput control={control} name='couponCode' label='Coupon Code' />
                    </Grid>
                    <Grid item xs={12}>
                        <AppTextInput type='datetime-local' control={control} name='validUntil' label='Valid Until' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppSelectListKeyId control={control} items={products} name='productId' label='Product' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='discountValue' label='Discount Value' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='discountUnit' label='Discount Unit' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='minimumOrderValue' label='Minimum Order Value' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AppTextInput type='number' control={control} name='maximumDiscountAmount' label='Maximum Discount Amount' />
                    </Grid>
                </Grid>
                <Box display='flex' justifyContent='space-between' sx={{ mt: 3 }}>
                    <Button onClick={cancelEdit} variant='contained' color='inherit'>Cancel</Button>
                    <LoadingButton loading={isSubmitting} type='submit' variant='contained' color='success'>Submit</LoadingButton>
                </Box>
            </form>
        </Box>
    )
}