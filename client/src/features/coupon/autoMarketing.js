import {Box, Paper, Typography, Grid, Button} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import agent from "../../app/api/agent";
import {LoadingButton} from "@mui/lab";
import AppTextInput from "../../app/components/AppTextInput";
import * as yup from "yup"; // Import yup

// Define your validation schema
const validationMarketingInfoSchema = yup.object({
    couponId: yup.number().required(),
    description: yup.string().required(),
    subject: yup.string().required(),
    scheduleOn: yup
        .date()
        .required("Date is required")
        .min(new Date(), "Date must be in the future"),
});

export default function AutoMarketing({
                                          coupon,
                                          cancelEdit,
                                      }) {
    const {
        control,
        reset,
        handleSubmit,
        formState: {isDirty, isSubmitting},
    } = useForm({
        resolver: yupResolver(validationMarketingInfoSchema), // Use the new validation schema
        defaultValues: {
            // Define your default values here
            couponId: coupon ? coupon.couponId : "",
            description: "",
            subject: "",
            scheduleOn: new Date().toISOString().slice(0, 16),
        },
    });

    const [data,setData] = useState({});

    useEffect(() => {
        agent.Coupon.getMarketingCouponInfo(coupon.id).then((res)=>{
            setData(res);
            if (coupon && !isDirty) {
                reset({
                    couponId: coupon.id,
                    description: res && res.description ? res.description : "",
                    subject: res && res.subject ? res.subject : "",
                    scheduleOn: res && res.scheduleOn ? new Date(res.scheduleOn).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                });
            }
        }).catch((err)=>console.log(err))

    }, [coupon, reset, isDirty]);

    async function handleSubmitData(data) {
        try {
            let response = await agent.Coupon.createMarketingCoupon(data);
            cancelEdit();
        } catch (error) {
            console.log(error);
        }
    }

    async function handleCancelMarketing() {
        try {
            if (data){
                let response = await agent.Coupon.cancelMarketingCoupon(data.id);
                cancelEdit();
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Box component={Paper} sx={{p: 4}}>
            <Typography variant="h4" gutterBottom sx={{mb: 4}}>
                Coupon Marketing Setting
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <AppTextInput control={control} name="description" label="Description"/>
                    </Grid>
                    <Grid item xs={12}>
                        <AppTextInput control={control} name="subject" label="Subject"/>
                    </Grid>
                    <Grid item xs={12}>
                        <AppTextInput
                            type="datetime-local"
                            control={control}
                            name="scheduleOn"
                            label="Schedule On"
                        />
                    </Grid>
                </Grid>
                <Box display="flex" justifyContent="space-between" sx={{mt: 3}}>
                    <Button onClick={cancelEdit} variant="contained" color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleCancelMarketing} variant="contained" color="warning">
                        Cancel Marketing Campaign
                    </Button>
                    <LoadingButton
                        loading={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="success"
                    >
                        Submit
                    </LoadingButton>
                </Box>
            </form>
        </Box>
    );
}
