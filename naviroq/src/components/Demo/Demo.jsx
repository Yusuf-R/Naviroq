'use client';
import {
    CircularProgress,
    Button,
    Box,
    Typography,
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
            <Box
                sx={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',  // Semi-transparent background
                    background: 'linear-gradient(to right, #232526, #414345)',

                }}
            >
                <CircularProgress color="primary" size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: "#FFF" }}>
                    Loading map, please wait...
                </Typography>
            </Box>
        </>
    )
}

export default Demo;
