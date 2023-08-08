import { Elements } from "@stripe/react-stripe-js";
import CheckoutPage from "./CheckoutPage";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import agent from "../../app/api/agent";
import { useAppDispatch } from "../../app/store/configureStore";
import { setBasket } from "../basket/basketSlice";
import LoadingComponent from "../../app/layout/LoadingComponent";

const stripePromise = loadStripe('pk_test_51Mz1BRHBS55y5kkc7tJ2GFZ2sGLGerCPJOxOOkrQKAUAaW8HyH1sKqBMsFuGAdimMbCxSw8CSpEzEoXKvY89tils005EJ9Ano2');

export default function CheckoutWrapper() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        agent.Payments.createPaymentIntent()
            .then(response => dispatch(setBasket(response)))
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }, [dispatch]);

    if (loading) return <LoadingComponent message='Loading checkout' />

    return (
        <Elements stripe={stripePromise}>
            <CheckoutPage />
        </Elements>
    )
} 