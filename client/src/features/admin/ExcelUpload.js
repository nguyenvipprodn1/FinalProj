import React, { useState, useEffect } from "react";
import agent from "../../app/api/agent"
import { Container, Grid, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useAppDispatch} from "../../app/store/configureStore";
import {setProduct} from "../catalog/catalogSlice";

function ExcelUpload({ setOpenImportModal }) {
    const [file, setFile] = useState(null);
    const [mapping, setMapping] = useState({});
    const [fields, setFields] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [columnIndex, setColumnIndex] = useState([]);
    const [uploadStep, setUploadStep] = useState(1);
    const [excelData, setExcelData] = useState([]);
    const [allSelectsFilled, setAllSelectsFilled] = useState(false);

    // Fetch available fields from the backend when the component mounts
    useEffect(() => {
        agent.Admin
            .getFields()
            .then((response) => {
                setFields(response);
            })
            .catch((error) => {
                console.log(error)
            });
    }, []);

    const dispatch = useAppDispatch();

    // Function to update the mapping for a specific column
    const updateMapping = (column, field) => {
        setMapping({ ...mapping, [column]: field });
    };

    // Check if all select boxes have values selected
    useEffect(() => {
        const areAllSelectsFilled = fields.every((column) => !!mapping[column]);
        setAllSelectsFilled(areAllSelectsFilled);
    }, [fields, mapping]);

    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            agent.Admin
                .uploadExcels(formData)
                .then((response) => {
                    setExcelData(response);
                    setHeaders(Object.values(response[0] || {}));
                    setColumnIndex(Object.keys(response[0] || {}));
                    setUploadStep(2); // Move to the next step
                })
                .catch((error) => {
                    console.log(error)
                });
        } catch (error) {
            // Handle errors
        }
    };

    const handleFinalUpload = async () => {
        // Include the selected mapping in the request
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mapping", JSON.stringify(mapping));

        try {
            agent.Admin
                .finalUploadExcels(formData)
                .then((response) => {
                    setOpenImportModal(false);
                    dispatch(setProduct(response));
                })
                .catch((error) => {
                    console.log(error)
                });
            // Handle success or display a confirmation message
        } catch (error) {
            // Handle errors
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <Container>
            {uploadStep === 1 && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" style={{ marginBottom: '16px', fontWeight: 'bold' }}>Step 1: Choose and Upload Excel File</Typography>
                        <input
                            type="file"
                            accept=".xlsx"
                            id="file-input" // Add an id for styling
                            onChange={handleFileChange}
                            style={{ display: 'none' }} // Hide the default input
                        />
                        <label htmlFor="file-input">
                            <Button
                                variant="contained"
                                component="span"
                                color="primary"
                                startIcon={<CloudUploadIcon />} // Add the CloudUploadIcon
                            >
                                Upload Excel
                            </Button>
                        </label>
                        {file && (
                            <Button style={{ marginLeft: '16px' }} variant="contained" color="warning" onClick={handleFileUpload}>
                                Upload Excel
                            </Button>
                        )}
                    </Grid>
                </Grid>
            )}

            {uploadStep === 2 && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" style={{ marginBottom: '16px', fontWeight: 'bold' }}>
                            Step 2: Map Excel columns to fields:
                        </Typography>
                        {fields.map((column) => (
                            <Grid container spacing={2} key={column}>
                                <Grid item xs={4}>
                                    <InputLabel style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                                        Map column "{column}" to:
                                    </InputLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <FormControl variant="outlined" fullWidth style={{ marginBottom: '8px'}}>
                                        <Select
                                            value={mapping[column] || ''}
                                            onChange={(e) => updateMapping(column, e.target.value)}
                                        >
                                            <MenuItem value="">-- Select Field --</MenuItem>
                                            {headers.map((field) => (
                                                <MenuItem key={field} value={field}>
                                                    {field}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        ))}
                        {allSelectsFilled && (
                            <Button variant="contained" color="primary" onClick={handleFinalUpload}>
                                Upload with Mapping
                            </Button>
                        )}
                    </Grid>
                </Grid>
            )}


            {uploadStep === 3 && excelData.length > 0 && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" style={{ marginBottom: '16px', fontWeight: 'bold' }}>Step 3: Display Excel Data</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headers.map((column) => (
                                        <TableCell key={column}>
                                            {column}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {excelData.length >= 2 &&
                                    excelData.slice(1).map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {columnIndex.map((column, colIndex) => (
                                                <TableCell key={colIndex}>{row[column]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}

export default ExcelUpload;
