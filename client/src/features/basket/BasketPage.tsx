import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/store/configureStore";
import BasketSummary from "./BasketSummary";
import BasketTable from "./BasketTable";
import agent from "../../app/api/agent";
import { Coupon } from "../../app/models/coupon";
import {APPLY_COUPON} from "./basketSlice";

const couponFormStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
};

const inputStyle = {
    marginRight: "10px", // Add spacing between input and button
};

const text = {
    fontSize: "30px",
    fontWeight: "20",
};

export default function BasketPage() {
    const { basket } = useAppSelector(state => state.basket);
    const dispatch = useAppDispatch();

    // State for the coupon code input
    const [couponCode, setCouponCode] = useState<string>("");
    const [data, setData] = useState<Coupon | null>(null);
    const [disable, setDisable] = useState<boolean>(false);

    // State for displaying coupon validation result
    const [couponValidationMessage, setCouponValidationMessage] = useState<string>("");

    useEffect(() => {
        agent.Coupon.getCoupon(couponCode)
            .then((res) => {
                if (res) {
                    setData(res);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [couponCode]);

    const handleCouponSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (data && basket) {
            const { productId, discountUnit, minimumOrderValue, maximumDiscountAmount, discountValue } = data;

            // Find the item in the basket that matches the productId
            const matchingItem = basket.items.find((item) => item.productId === productId);

            if (matchingItem?.couponId){
                setDisable(true);
                setCouponValidationMessage("Coupon applied Already!");
                return;
            }

            if (matchingItem) {
                // Check if the coupon is valid based on your criteria
                const isValidCoupon =
                    discountUnit > 0 &&
                    basket.items.reduce((total, item) => total + item.price * item.quantity, 0) > minimumOrderValue;

                if (isValidCoupon) {
                    // Calculate the discount based on your criteria
                    const discountAmount = Math.min(maximumDiscountAmount, Math.floor(matchingItem.price / 100) * matchingItem.quantity * discountValue/100);
                    const updatedItem = {
                        ...matchingItem,
                        price: matchingItem.price * matchingItem.quantity - Math.floor(discountAmount * 100)
                    };

                    const itemIndex = basket.items.findIndex((basketItem) => basketItem.productId === matchingItem.productId);
                    if (itemIndex !== -1 && !matchingItem.couponId) {
                        // Create a new array of items with the updated item
                        const updatedItems = {
                            ...basket,
                            items: [
                                ...basket.items.slice(0, itemIndex), // Items before the updated item
                                updatedItem, // The updated item
                                ...basket.items.slice(itemIndex + 1), // Items after the updated item
                            ],
                        };

                        dispatch(APPLY_COUPON(updatedItems));


                        agent.Coupon.applyCoupon(couponCode).then(()=>{
                            setDisable(true)
                        }).catch((err)=>console.log(err))
                    }

                    setCouponValidationMessage("Coupon applied successfully!");
                } else {
                    setCouponValidationMessage("Invalid coupon code or conditions not met.");
                }
            } else {
                setCouponValidationMessage("No matching item in the basket for the coupon.");
            }
        } else {
            setCouponValidationMessage("Invalid coupon code or no basket data.");
        }
    };

    if (!basket || basket.items.length === 0) {
        return <Typography variant="h3">Your basket is empty</Typography>;
    }

    return (
        <>
            <BasketTable items={basket.items} />
            <Grid container>
                <Grid item xs={6} />
                <Grid item xs={6}>
                    <BasketSummary />
                    <form onSubmit={handleCouponSubmit} style={couponFormStyle}>
                        <label htmlFor="couponCode" style={text}>
                            Coupon Code:
                        </label>
                        <input
                            type="text"
                            id="couponCode"
                            value={couponCode}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                            style={inputStyle}
                        />
                        <Button disabled={disable} type="submit" variant="contained" size="large">
                            Apply Coupon
                        </Button>
                    </form>
                    <p>{couponValidationMessage}</p>
                    <Button component={Link} to="/checkout" variant="contained" size="large" fullWidth>
                        Checkout
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}
