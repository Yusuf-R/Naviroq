import React from "react";
import { Box, Typography, Card, CardContent, Grid, Avatar, Chip, Divider, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NearMeIcon from "@mui/icons-material/NearMe";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import { useRouter } from "next/navigation";
import useClientStore from "@/store/useClientStore"; // Zustand store for ride data

function MyRides({ clientProfile, rides }) {
    const router = useRouter();
    const setRide = useClientStore((state) => state.setRide);

    if (!rides || rides.length === 0) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h6" color="textSecondary">
                    No rides available. Once you accept a ride, it will appear here.
                </Typography>
            </Box>
        );
    }

    const handleRideClick = (ride) => {
        // Set the selected ride in Zustand
        setRide(ride);

        if (ride.status === "in-progress") {
            // Navigate to progress.jsx for in-progress rides
            router.push("/progress");
        } else if (ride.status === "completed") {
            // Navigate to view.jsx for completed rides
            router.push("/view");
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}>
                My Rides
            </Typography>
            <Grid container spacing={3}>
                {rides.map((ride) => (
                    <Grid item xs={12} md={6} key={ride.id}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": { transform: "scale(1.02)" },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                                        <DriveEtaIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        Ride #{ride.id.slice(-5)}
                                    </Typography>
                                    <Chip
                                        label={ride.status.replace("-", " ").toUpperCase()}
                                        color={
                                            ride.status === "in-progress"
                                                ? "warning"
                                                : ride.status === "completed"
                                                ? "success"
                                                : "default"
                                        }
                                        sx={{ ml: "auto", fontWeight: "bold" }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                                    >
                                        <LocationOnIcon sx={{ mr: 1, color: "success.main" }} />
                                        <strong>Pickup:</strong> {ride.pickupLocation.formatted_address}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                                    >
                                        <NearMeIcon sx={{ mr: 1, color: "error.main" }} />
                                        <strong>Destination:</strong> {ride.destinationLocation.formatted_address}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                                    >
                                        <strong>Distance:</strong> {ride.distance || "N/A"} km
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                                    >
                                        <strong>Duration:</strong> {ride.duration || "N/A"} mins
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Offer:</strong> ₦{ride.offer}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>ETA:</strong> {ride.eta || "Calculating..."}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ textAlign: "right" }}>
                                    <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        sx={{ fontStyle: "italic" }}
                                    >
                                        Last updated: {new Date(ride.updatedAt.seconds * 1000).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleRideClick(ride)}
                                    >
                                        {ride.status === "in-progress" ? "Track Progress" : "View Ride"}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default MyRides;
