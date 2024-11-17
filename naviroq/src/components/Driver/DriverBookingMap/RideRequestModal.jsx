import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NearMeIcon from "@mui/icons-material/NearMe";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Collapse from "@mui/material/Collapse";
import InputAdornment from "@mui/material/InputAdornment";
import PaymentsIcon from "@mui/icons-material/Payments";


import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import { toast } from "sonner";

function RideRequestModal({ selectedRide, onAccept, onCounterOffer, onDecline, onClose }) {
    const [counterOffer, setCounterOffer] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [offerHistory, setOfferHistory] = useState([]);
    const [waitingForClientResponse, setWaitingForClientResponse] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);


    useEffect(() => {
        if (selectedRide) {
            const initialOffer = selectedRide.offer || 0;
            setCounterOffer(initialOffer.toString());
            setOfferHistory([{ type: "client", offer: initialOffer }]);
            setWaitingForClientResponse(false);
            setIsEditing(false);
        }
    }, [selectedRide]);

    
    useEffect(() => {
        if (!selectedRide) return;

        const tripRef = doc(db, "tripRequests", selectedRide.id);
        const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const tripData = docSnapshot.data();

                if (tripData.counterOffer && tripData.status === "countered" && tripData.source === "client") {
                    setOfferHistory((prev) => {
                        const isDuplicate = prev.some(entry => entry.type === "client" && entry.offer === tripData.counterOffer);
                        if (!isDuplicate) {
                            return [...prev, { type: "client", offer: tripData.counterOffer }];
                        }
                        return prev;
                    });
                    setWaitingForClientResponse(false);
                }
                if (tripData.status === "cancelled" && tripData.message) {
                    toast.error(tripData.message);
                    onClose();
                }

                // Handle client declining the offer
                if (tripData.status === "declined" && tripData.message) {
                    toast.error(tripData.message);
                    setWaitingForClientResponse(false); // Stop waiting for client response
                    onClose(); // Close the modal
                }
            }
        });

        return () => unsubscribe();
    }, [selectedRide]);





    const handleCounterOfferChange = (value) => {
        // Allow only empty string or positive integers (no decimals)
        if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
            setCounterOffer(value); // Keep the value as a string to handle deletions
            setIsEditing(true);
        }
    };

    const handleAdjustOffer = (adjustment) => {
        const currentAmount = parseInt(counterOffer) || 0;
        const newAmount = currentAmount + adjustment;
        if (newAmount >= 300) {
            handleCounterOfferChange(newAmount);
        }
    };

    // const handleSubmitCounterOffer = async () => {
    //     const numericOffer = parseInt(counterOffer);
    //     if (!numericOffer || numericOffer < 300) {
    //         toast.error("Minimum offer amount is ₦300");
    //         return;
    //     }
    //     try {
    //         await updateDoc(doc(db, "tripRequests", selectedRide.id), {
    //             status: "countered",
    //             counterOffer: Number(numericOffer),
    //             source: "driver",
    //         });
    //         setOfferHistory((prev) => [...prev, { type: "driver", offer: numericOffer }]);
    //         setWaitingForClientResponse(true);
    //         setIsEditing(false);
    //         toast.success("Counter offer submitted!");
    //     } catch (error) {
    //         console.error("Error submitting counter offer:", error);
    //         toast.error("Failed to submit counter offer.");
    //     }
    // };

    const handleSubmitCounterOffer = async () => {
        const numericOffer = parseInt(counterOffer, 10);
        if (!numericOffer || numericOffer < 300) {
            toast.error("Minimum offer amount is ₦300");
            return;
        }
        // Use the prop passed from the parent
        await onCounterOffer(selectedRide.id, numericOffer);
        setOfferHistory((prev) => [...prev, { type: "driver", offer: counterOffer }]);
        setWaitingForClientResponse(true);
        setIsEditing(false);
    };
    

    return (
        <Dialog open={Boolean(selectedRide)} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1565C0" }}>
                    New Ride Request
                </Typography>
                <Button onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <ExpandLessIcon /> : <MinimizeIcon />}
                </Button>
            </DialogTitle>
            <DialogContent>
                <Collapse in={!isMinimized}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            backgroundColor: "#E3F2FD",
                            borderRadius: 4,
                            p: 2,
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <LocationOnIcon sx={{ fontSize: 30, color: "#4CAF50" }} />
                            <Typography variant="h6" sx={{ flex: 1, color: "#1565C0" }}>
                                From: <span>{selectedRide?.pickupLocation.formatted_address || "N/A"}</span>
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <NearMeIcon sx={{ fontSize: 30, color: "#FF1744" }} />
                            <Typography variant="h6" sx={{ flex: 1, color: "#FF5252" }}>
                                To: <span>{selectedRide?.destinationLocation.formatted_address || "N/A"}</span>
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <DirectionsCarIcon sx={{ fontSize: 20, color: "blue" }} />
                            <Typography variant="h6" sx={{ color: "#37474F" }}>
                                Mode: <span style={{ color: "#0277BD" }}>{selectedRide?.transportationMode || "N/A"}</span>
                            </Typography>
                        </Box>
                        {/* Trip Cost */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                borderRadius: 2,
                            }}
                        >
                            <PaymentsIcon sx={{ fontSize: 20, color: "limegreen" }} />
                            <Typography variant="h6" sx={{ color: "#37474F" }}> Cost: <span style={{ color: "#0277BD" }}>₦{selectedRide?.offer || "N/A"}</span></Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{
                            textAlign: "center",
                            mt: 4,
                            color: "#0D47A1",
                            background: '#E3F2FD',
                        }}>
                            Offer History</Typography>

                        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                            {offerHistory.map((entry, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        justifyContent: entry.type === "client" ? "flex-start" : "flex-end",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 4,
                                            backgroundColor: entry.type === "client" ? "#E3F2FD" : "#FFEBEE",
                                            maxWidth: "70%",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: "bold", color: entry.type === "client" ? "#1565C0" : "#D32F2F" }}
                                        >
                                            {entry.type === "client" ? "Client Offer" : "Your Offer"}: ₦{entry.offer}
                                        </Typography>
                                        {index === offerHistory.length - 1 && waitingForClientResponse && entry.type === "driver" && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                                <CircularProgress size={16} />
                                                <Typography variant="body2" sx={{ color: "#666" }}>Waiting for client's response...</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ textAlign: "center", color: "#0D47A1" }}>
                            Adjust Offer
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleAdjustOffer(-100)}
                                disabled={parseInt(counterOffer) <= 300}
                                sx={{
                                    color: "#FF1744",
                                    borderColor: "#FF1744",
                                    "&:hover": { backgroundColor: "rgba(255, 23, 68, 0.1)" }
                                }}
                            >
                                - ₦100
                            </Button>
                            <TextField
                                variant="outlined"
                                type="text" // Use "text" instead of "number" to prevent native restrictions
                                value={counterOffer}
                                onChange={(e) => handleCounterOfferChange(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                                }}
                                sx={{ width: "150px" }}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => handleAdjustOffer(100)}
                                sx={{
                                    color: "#4CAF50",
                                    borderColor: "#4CAF50",
                                    "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" }
                                }}
                            >
                                + ₦100
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleSubmitCounterOffer}
                            disabled={!isEditing || parseInt(counterOffer) < 300}
                            sx={{
                                backgroundColor: "#FB8C00",
                                "&:hover": { backgroundColor: "#F57C00" },
                                width: "100%",
                                mt: 2,
                            }}
                        >
                            Submit Counter Offer
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={() => onAccept(selectedRide.id)}
                            sx={{ backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#388E3C" } }}
                            disabled={waitingForClientResponse}
                        >
                            Accept
                        </Button>
                        {counterOffer && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => onDecline(selectedRide)} // Pass the selectedRide back to DriverMap
                                sx={{ "&:hover": { backgroundColor: "red" } }}
                            >
                                Decline Offer
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            onClick={() => onDecline(selectedRide.id)}
                            sx={{ color: "#FF1744", borderColor: "#FF1744" }}
                        >
                            Cancel Trip Request
                        </Button>
                    </Box>
                </Collapse>
            </DialogContent>
        </Dialog>
    );
}

export default RideRequestModal;
