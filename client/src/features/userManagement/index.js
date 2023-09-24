import { Edit, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import {useEffect, useState} from "react";
import agent from "../../app/api/agent";
import EditUser from "./update";
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(undefined);

    useEffect(() => {
        loadUsers();
    }, []);

    function handleSelectUser(user) {
        setSelectedUser(user);
        setEditMode(true);
    }

    function loadUsers(){
        agent.Account.getAll()
            .then((res) => {
                setUsers(res)
            })
            .catch(error => console.log(error))
    }

    function handleDeleteUser(id) {
        agent.Account.delete(id)
            .then(() => {
                loadUsers();
            })
            .catch(error => console.log(error))
    }

    function cancelEdit() {
        if (selectedUser) setSelectedUser(undefined);
        setEditMode(false);
    }

    if (editMode) return <EditUser user={selectedUser} load={loadUsers} cancelEdit={cancelEdit} />

    return (
        <>
            <Box display='flex' justifyContent='space-between'>
                <Typography sx={{ p: 2 }} variant='h4'>Users</Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align="left">Email</TableCell>
                            <TableCell align="right">UserName</TableCell>
                            <TableCell align="right">Role</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {user.id}
                                </TableCell>
                                <TableCell align="center">{user.email}</TableCell>
                                <TableCell align="center">{user.userName}</TableCell>
                                <TableCell align="center">{user.role}</TableCell>
                                <TableCell align="right">
                                    <Button onClick={() => handleSelectUser(user)} startIcon={<Edit />} />
                                    <LoadingButton
                                        onClick={() => handleDeleteUser(user.id)}
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