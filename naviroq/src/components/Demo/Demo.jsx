'use client';
import {
    CircularProgress,
    Button,
    Box,
} from "@mui/material";
import { useState } from "react";


function Demo() {
    const [loading, setLoading] = useState(false);
    const onCLick = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        setLoading(false);
    };
    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}>
            <Button
                variant="contained"
                color="primary"
                onClick={onCLick}
                disabled={loading}
            >
                {loading ? <CircularProgress size={20} /> : "Click Me"}
                </Button>
                </Box>
        </>
    )
}

export default Demo;