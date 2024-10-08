"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { toast } from "sonner";

function KebbiRides() {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          textAlign: 'center',
          padding: '10px',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)',
          border: '2 px solid blue',
        }}
      >
        <Typography>Welcome to Naviroq</Typography>

        <Button onClick={() => toast.success("Welcome user")} color='success' size="small" variant="contained"> 
          Testing Toast
        </Button>
      </Box>
    </>
  );
}

export default KebbiRides;
