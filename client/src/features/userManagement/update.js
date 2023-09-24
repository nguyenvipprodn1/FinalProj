import { Box, Paper, Typography, Grid, Button } from "@mui/material";
import {  useForm } from "react-hook-form";
import AppSelectList from "../../app/components/AppSelectList";
import { yupResolver } from '@hookform/resolvers/yup';
import agent from "../../app/api/agent";
import { LoadingButton } from "@mui/lab";
import * as yup from "yup";
import {useEffect} from "react";

const validationSchema = yup.object({
    role: yup.string().required(),
})

export default function EditUser({ user, cancelEdit, load }) {
    const { control, reset, handleSubmit, watch, formState: { isDirty, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        if (user) reset(user);
    }, [user, reset])

    async function handleSubmitData(data) {
        try {
            let response;
            response = await agent.Account.updateUser(user.id,{role: data.role});
            cancelEdit();
            load();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Box component={Paper} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Update Role
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <AppSelectList control={control} items={["Staff","Admin", "Member"]} name='role' label='Role' />
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