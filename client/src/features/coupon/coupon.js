import React, {useEffect, useState} from "react";
import { Edit, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import agent from "../../app/api/agent";
import CouponForm from "./couponForm";

export default function Coupon() {
    const [coupons, setCoupons] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState(0);

    useEffect(()=>{
        getAll();
    },[])

    function getAll() {
        agent.Coupon.getAll().then((res)=>{
            setCoupons(res);
        }).catch((err)=>{console.log(err)})
    }

    function handleSelectCoupon(product) {
        setSelectedCoupon(product);
        setEditMode(true);
    }

    function handleDeleteCoupon(id) {
        setLoading(true);
        setTarget(id)
        agent.Coupon.deleteCoupon(id).then((res)=>{
            getAll();
        }).catch((err)=>{console.log(err)});
    }

    function cancelEdit() {
        if (selectedCoupon) setSelectedCoupon(undefined);
        setEditMode(false);
    }

    if (editMode) return <CouponForm coupon={selectedCoupon} cancelEdit={cancelEdit} getAll={getAll} />

    return (
        <>
            <Box display='flex' justifyContent='space-between'>
                <Typography sx={{ p: 2 }} variant='h4'>Inventory</Typography>
                <Box>
                    <Button onClick={() => setEditMode(true)} sx={{ m: 2 }} size='large' variant='contained'>Create</Button>
                </Box>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 850 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align="left">Product</TableCell>
                            <TableCell align="right">Discount Value</TableCell>
                            <TableCell align="right">Discount Unit</TableCell>
                            <TableCell align="center">Date Created</TableCell>
                            <TableCell align="center">Date Valid Until</TableCell>
                            <TableCell align="center">Coupon Code</TableCell>
                            <TableCell align="center">Minimum Order Value</TableCell>
                            <TableCell align="center">Maximum Discount Amount</TableCell>
                            <TableCell align="center">Is Active</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow
                                key={coupon.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {coupon.id}
                                </TableCell>
                                <TableCell align="center">{coupon.product.name}</TableCell>
                                <TableCell align="right">{coupon.discountValue}</TableCell>
                                <TableCell align="right">{coupon.discountUnit}</TableCell>
                                <TableCell align="right">{new Date(coupon.dateCreated).toISOString().slice(0, 10)}</TableCell>
                                <TableCell align="right">{new Date(coupon.validUntil).toISOString().slice(0, 10)}</TableCell>
                                <TableCell align="right">{coupon.couponCode}</TableCell>
                                <TableCell align="right">{coupon.minimumOrderValue}</TableCell>
                                <TableCell align="right">{coupon.maximumDiscountAmount}</TableCell>
                                <TableCell align="right">{coupon.isActive?"Active":"In Active"}</TableCell>
                                <TableCell align="right">
                                    <Button onClick={() => handleSelectCoupon(coupon)} startIcon={<Edit />} />
                                    <LoadingButton
                                        loading={loading && target === coupon.id}
                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                        startIcon={<Delete />} color='error' />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}