import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Collapse from "@mui/material/Collapse";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import { toast } from "sonner";

function WaitingModal({ tripRequestId, initialOffer, onCancel, onClose, onAcceptCounterOffer }) {
    const [countdown, setCountdown] = useState(120);
    const [driverAvailable, setDriverAvailable] = useState(false);
    const [driverDetails, setDriverDetails] = useState(null);
    const [counterOffer, setCounterOffer] = useState(null);
    const [clientCounterOffer, setClientCounterOffer] = useState("");
    const [history, setHistory] = useState([{ type: "client", offer: initialOffer }]);
    const [lastClientOffer, setLastClientOffer] = useState(initialOffer);
    const [isMinimized, setIsMinimized] = useState(false); // Minimize/expand modal
    const [cooldownTime, setCooldownTime] = useState(null); // Cooldown timer
    const [acceptButtonEnabled, setAcceptButtonEnabled] = useState(false);

    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        if (countdown <= 0) clearInterval(timer);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (countdown === 0) handleTimeout();
    }, [countdown]);

    const handleTimeout = () => {
        if (!driverAvailable) {
            toast.error("No drivers available.");
        }
    };

    useEffect(() => {
        if (!tripRequestId) return;

        const tripRef = doc(db, "tripRequests", tripRequestId);

        const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const tripData = docSnapshot.data();
                const currentTime = new Date().getTime();
                const retryTime = tripData.retryAllowedAt || 0;

                // Capture driverDetails if they exist
                if (tripData.driverDetails) {
                    setDriverDetails((prevDetails) => ({
                        ...prevDetails,
                        ...tripData.driverDetails, // Update driver-specific details
                    }));
                }

                // Handle driver acceptance
                if (tripData.status === "awaiting-client-confirmation") {
                    setDriverAvailable(true);
                    setAcceptButtonEnabled(true); // Enable the Accept Offer button
                    toast.info(`Driver ${tripData.driverDetails?.name} is awaiting your confirmation.`);
                }

                // Handle final acceptance by both parties
                if (tripData.status === "accepted") {
                    setDriverAvailable(true);
                    setAcceptButtonEnabled(false); // Disable the Accept button
                    setDriverDetails(tripData.driverDetails);
                    toast.success("Your ride request has been accepted!");
                    // Close the modal after 2 seconds
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                }

                // Handle counter offers from the driver
                if (
                    tripData.status === "countered" &&
                    tripData.counterOffer !== lastClientOffer && // Ensure it's a new offer
                    tripData.source === "driver" // Ensure it's from the driver
                ) {
                    setCounterOffer(tripData.counterOffer); // Update counter offer
                    setAcceptButtonEnabled(true); // Enable the Accept Offer button
                    setHistory((prevHistory) => {
                        // Add the new driver offer only if it's unique
                        const isDuplicate = prevHistory.some(
                            (entry) => entry.type === "driver" && entry.offer === tripData.counterOffer
                        );
                        if (!isDuplicate) {
                            return [...prevHistory, { type: "driver", offer: tripData.counterOffer }];
                        }
                        return prevHistory;
                    });
                }

                // Notify the client if the driver declined the offer
                if (tripData.status === "declined" && tripData.message) {
                    if (currentTime < retryTime) {
                        const remainingTime = Math.ceil((retryTime - currentTime) / 1000);
                        toast.info(`Offer declined. You can retry in ${remainingTime} seconds.`);
                    } else {
                        toast.error(tripData.message);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [tripRequestId, lastClientOffer]);


    useEffect(() => {
        if (!tripRequestId) return;

        const tripRef = doc(db, "tripRequests", tripRequestId);
        const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const tripData = docSnapshot.data();

                // Update the cooldown timer if applicable
                const now = new Date().getTime();
                if (tripData.retryAllowedAt && tripData.retryAllowedAt > now) {
                    const timeLeft = tripData.retryAllowedAt - now;
                    setCooldownTime(timeLeft);
                } else {
                    setCooldownTime(null); // Cooldown expired
                }
            }
        });

        return () => unsubscribe();
    }, [tripRequestId]);

    useEffect(() => {
        if (cooldownTime === null) return;

        const timer = setInterval(() => {
            setCooldownTime((prev) => Math.max(0, prev - 1000)); // Decrease by 1 second
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownTime]);

   

    // Submit Client Counter Offer
    const handleSubmitClientCounterOffer = async () => {
        try {
            const clientOffer = parseInt(clientCounterOffer);

            // Check if this offer is different from the last offer
            if (clientOffer === lastClientOffer) {
                toast.error("Please enter a different amount from your last offer.");
                return;
            }

            // Update Firestore with the client's offer
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
                status: "countered",
                counterOffer: clientOffer,
                source: "client" // Indicate this is a client offer
            });

            // Update the history with only the client's offer
            setHistory(prevHistory => [...prevHistory, { type: "client", offer: clientOffer }]);
            setLastClientOffer(clientOffer); // Update the last client offer
            setClientCounterOffer("");
            toast.success("Counter offer submitted!");
        } catch (error) {
            console.error("Error submitting counter offer:", error);
            toast.error("Failed to submit your offer.");
        }
    };

    // Decline Driver Offer
    const handleDeclineOffer = async () => {
        console.log({ driverDetails });
        if (!driverDetails?.driverId) {
            toast.error("Driver ID is missing for the selected ride.");
            return;
        }

        try {
            const retryAfter = new Date();
            retryAfter.setMinutes(retryAfter.getMinutes() + 1); // 1-minute cooldown

            // Update Firestore with necessary changes
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
                status: "negotiation", // Keep negotiation open
                counterOffer: null,   // Reset counter-offer
                retryAllowedAt: retryAfter.getTime(), // Cooldown expiration time
                message: "Client declined the offer.",
                declinedOffers: arrayUnion(driverDetails.driverId), // Add to declined offers list
            });

            setCounterOffer(null);
            toast.info("Offer declined. Other drivers are still available.");
        } catch (error) {
            console.error("Error declining offer:", error);
            toast.error("Failed to decline the offer.");
        }
    };

    // Cancel Trip Request
    const handleCancelTrip = async () => {
        try {
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
                status: "cancelled",
                message: "Client cancelled the trip request.",
            });
            onCancel();
        } catch (error) {
            console.error("Error cancelling trip request:", error);
            toast.error("Failed to cancel the trip request.");
        }
    };


    return (
        <Dialog open fullWidth maxWidth="md" onClose={onCancel}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#007BFF" }}>
                    {driverAvailable ? "Driver Found!" : "Searching for Available Drivers..."}
                </Typography>
                <Button onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <ExpandLessIcon /> : <MinimizeIcon />}
                </Button>
            </DialogTitle>

            <Collapse in={!isMinimized}>
                <DialogContent>
                    {driverAvailable ? (
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Avatar
                                src={driverDetails.avatar}
                                alt="Driver Avatar"
                                sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                            />
                            <Typography variant="h6">Driver: {driverDetails.name}</Typography>
                            <Typography variant="body1">Vehicle: {driverDetails.vehicleType} - {driverDetails.vehiclePlateNumber}</Typography>
                            <Typography variant="body1">ETA: {driverDetails.eta || "N/A"} minutes</Typography>
                            <Button variant="contained" sx={{ mt: 4 }} onClick={onCancel}>
                                OK
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1">Client Initial Offer: ₦{initialOffer}</Typography>

                            {/* Offer History - Chat Style */}
                            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                {history.map((entry, index) => (
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
                                                {entry.type === "client" ? "Your Offer" : "Driver's Offer"}: ₦{entry.offer}
                                            </Typography>
                                            {index === history.length - 1 && entry.type === "client" && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                                    <CircularProgress size={16} />
                                                    <Typography variant="body2" sx={{ color: "#666" }}>Waiting for driver's response...</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Counter Offer Input */}
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Your Counter Offer"
                                    type="number"
                                    variant="outlined"
                                    value={clientCounterOffer}
                                    onChange={(e) => setClientCounterOffer(e.target.value)}
                                    sx={{ mb: 2 }}
                                    disabled={cooldownTime > 0} // Disable input during cooldown
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSubmitClientCounterOffer}
                                    sx={{
                                        backgroundColor: cooldownTime > 0 ? "#ccc" : "#FB8C00", // Change button color during cooldown
                                        "&:hover": { backgroundColor: cooldownTime > 0 ? "#ccc" : "#F57C00" },
                                        width: "100%",
                                    }}
                                    disabled={!clientCounterOffer || cooldownTime > 0} // Disable button during cooldown or if input is empty
                                >
                                    {cooldownTime > 0
                                        ? `Wait ${Math.ceil(cooldownTime / 1000)}s`
                                        : "Submit Counter Offer"} {/* Show countdown if cooling down */}
                                </Button>
                            </Box>

                        </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={onAcceptCounterOffer}
                            disabled={!acceptButtonEnabled} // Disable the button until a counteroffer exists
                            sx={{
                                backgroundColor: acceptButtonEnabled ? "#4CAF50" : "#BDBDBD", // Different color when disabled
                                "&:hover": { backgroundColor: acceptButtonEnabled ? "#388E3C" : "#BDBDBD" },
                            }}
                        >
                            Accept Offer
                        </Button>
                        {counterOffer && (
                            <Button
                                variant="contained"
                                color='secondary'
                                onClick={handleDeclineOffer}
                                sx={{ "&:hover": { backgroundColor: "red" } }}
                            >
                                Decline Offer
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            onClick={handleCancelTrip}
                            sx={{ color: "#FF1744", borderColor: "#FF1744", "&:hover": { backgroundColor: "rgba(255, 23, 68, 0.1)" } }}
                        >
                            Cancel Trip Request
                        </Button>
                    </Box>
                </DialogContent>
            </Collapse>
        </Dialog>
    );
}

export default WaitingModal;