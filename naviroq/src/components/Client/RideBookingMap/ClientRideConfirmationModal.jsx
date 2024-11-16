import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Avatar,
} from "@mui/material";

function ClientRideConfirmationModal({ isOpen, onConfirm, onCancel, tripDetails }) {
    if (!tripDetails) {
        return (
            <Dialog open={isOpen} onClose={onCancel} fullWidth maxWidth="sm">
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="error">
                        Unable to load trip details. Please try again later.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    const { driverDetails, pickupLocation, destinationLocation, finalOffer } = tripDetails;

    return (
        <Dialog open={isOpen} onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>Confirm Your Ride</DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom>Your Driver:</Typography>
                <Avatar
                    src={driverDetails?.avatar || "default-avatar-url"}
                    alt={driverDetails?.name || "Driver"}
                    sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="body1">
                    <strong>Name:</strong> {driverDetails?.name || "Unknown"}
                </Typography>
                <Typography variant="body1">
                    <strong>Vehicle:</strong> {driverDetails?.vehicleType || "N/A"} ({driverDetails?.vehiclePlateNumber || "N/A"})
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Pickup:</strong> {pickupLocation?.formatted_address || "N/A"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Destination:</strong> {destinationLocation?.formatted_address || "N/A"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Final Offer:</strong> ₦{finalOffer || "N/A"}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="secondary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="primary" variant="contained">
                    Confirm Ride
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ClientRideConfirmationModal;
