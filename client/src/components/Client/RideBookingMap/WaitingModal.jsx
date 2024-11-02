import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig"; // Ensure you have Firebase correctly initialized
import { toast } from "sonner";

function WaitingModal({ tripRequestId, onCancel }) {
    const [countdown, setCountdown] = useState(120); // 2 minutes (120 seconds)
    const [driverAvailable, setDriverAvailable] = useState(false);
    const [driverDetails, setDriverDetails] = useState(null);

    // Countdown logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        if (countdown <= 0) {
            clearInterval(timer);
        }

        return () => clearInterval(timer);
    }, [countdown]);

    // Listen for driver updates in Firebase
    useEffect(() => {
        if (!tripRequestId) return;

        const tripRef = doc(db, "tripRequests", tripRequestId);
        const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const tripData = docSnapshot.data();
                if (tripData.status === "accepted") {
                    setDriverAvailable(true);
                    setDriverDetails(tripData.driverDetails); // Assuming driverDetails are available
                }
            }
        });

        return () => unsubscribe(); // Cleanup listener when component unmounts
    }, [tripRequestId]);

    // Handler when countdown ends
    const handleTimeout = () => {
        if (!driverAvailable) {
            toast.error("Failed:");
            toast.info('Sorry, no driver available at the moment.');
            toast.info('Please try again later.');
            // close the modal automatically
            
        }
        onCancel(); // Close the modal
    };

    useEffect(() => {
        if (countdown === 0) {
            handleTimeout();
        }
    }, [countdown]);

    return (
        <Dialog open fullWidth maxWidth="md" onClose={onCancel}>
            <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem", color: "#007BFF" }}>
                {driverAvailable ? "Driver Found!" : "Searching for Available Drivers..."}
            </DialogTitle>
            <DialogContent>
                {driverAvailable ? (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="h6">Driver: {driverDetails.name}</Typography>
                        <Typography variant="body1">Car Model: {driverDetails.carModel}</Typography>
                        <Typography variant="body1">ETA: {driverDetails.eta} minutes</Typography>
                        <Button variant="contained" sx={{ mt: 4 }} onClick={onCancel}>
                            OK
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <CircularProgress />
                        <Typography variant="h6">Please wait, searching for drivers...</Typography>
                        <Typography variant="body2">Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</Typography>
                        <Box sx={{ width: "100%" }}>
                            <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={50} />
                        </Box>
                        <Button variant="contained" color="error" onClick={onCancel}>
                            Cancel Search
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default WaitingModal;
