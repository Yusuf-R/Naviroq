"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from "@react-google-maps/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import NearMeIcon from '@mui/icons-material/NearMe';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { keyframes } from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import { googleMapsLibraries } from "@/server/googleMaps/googleMapsConfig";
import { toast } from "sonner";
import WaitingModal from "./WaitingModal";
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    height: "100%",
    width: "100%",
};

// Radar pulse animation style
const radarPulse = {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 123, 255, 0.3)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    animation: "pulse 2s infinite",
    zIndex: 1000,
};

// Add keyframes for the radar pulse animation
const styles = `
@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
    }
}`
    ;

function RideBookingMap() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [pickupCoords, setPickupCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMode, setSelectedMode] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [pulseStyle, setPulseStyle] = useState({});
    const [basePrice, setBasePrice] = useState(0);
    const [showWaitingModal, setShowWaitingModal] = useState(false); // State to control waiting modal visibility
    const [tripRequestId, setTripRequestId] = useState(null); // Store the trip request ID
    const mapRef = useRef(null);

    const pickupRef = useRef(null);
    const destinationRef = useRef(null);

    // Function to calculate the price based on distance and duration
    const calculatePrice = (distance, duration) => {
        const baseFare = 300; // Fixed base fare
        const pricePerKm = 50; // Price per km
        const pricePerMin = 20; // Price per minute

        const distanceValue = parseFloat(distance.replace(" km", "")); // Extract km value
        const durationValue = parseInt(duration.replace(" mins", "")); // Extract minutes

        return baseFare + (distanceValue * pricePerKm) + (durationValue * pricePerMin);
    };

    // useEffect to get the current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };
                setCurrentLocation(location);
                setPickupCoords(location);
                setPickup("Using Current Location");
            },
            () => alert("Unable to retrieve your location"),
            { enableHighAccuracy: true }
        );
    }, []);


    // Function to handle place changed event
    const handlePlaceChanged = (autocomplete, setCoords, setValue) => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            setCoords({ lat: location.lat(), lng: location.lng() });
            setValue(place.formatted_address);
            validateInputs();
        }
    };

    const handleSendOffer = (newOffer) => {
        setBasePrice(newOffer); // Update the base price state
    };



    // Function to handle the confirm button click
    const handleConfirm = () => {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
            {
                origin: pickupCoords,
                destination: destinationCoords,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    const route = result.routes[0].legs[0];
                    setDistance(route.distance.text);
                    setDuration(route.duration.text);
                    const price = calculatePrice(route.distance.text, route.duration.text);
                    setBasePrice(price); // Store base price for offer process
                    setIsSearchEnabled(true);
                } else {
                    alert("Directions request failed.");
                }
            }
        );
    };


    // Function to validate the inputs
    const validateInputs = () => {
        const isFilled = pickup.trim() !== "" && destination.trim() !== "";
        setIsConfirmEnabled(isFilled);
    };



    // Function to stop the search
    const stopSearch = () => {
        setIsSearching(false);
        setPulseStyle({ display: "none" });
    };


    // Function to update the radar pulse position
    const updatePulsePosition = (coords) => {
        if (mapRef.current && coords) {
            const point = mapRef.current.getProjection().fromLatLngToPoint(
                new window.google.maps.LatLng(coords)
            );
            const scale = Math.pow(2, mapRef.current.getZoom());
            setPulseStyle({
                left: `${point.x * scale}px`,
                top: `${point.y * scale}px`,
                display: "block",
                position: "absolute",
                width: "200px",
                height: "200px",
                backgroundColor: "rgba(0, 123, 255, 0.3)",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                transform: "translate(-50%, -50%)",
            });
        }
    };


    const handleConfirmAndSearch = async (finalOffer) => {

        // Ensure all necessary inputs are filled
        if (!pickupCoords || !destinationCoords || !selectedMode) {
            alert("Please fill all the required fields.");
            return;
        }

        try {
            setIsSearching(true); // Start the search animation
            setModalOpen(false); // Close the modal
            setIsSearching(true); // Start the search animation
            setModalOpen(false); // Close the current modal
            setShowWaitingModal(true); // Show the waiting modal


            // Pan to the pickup location to focus on the radar pulse
            if (mapRef.current && pickupCoords) {
                mapRef.current.panTo(pickupCoords);
                mapRef.current.setZoom(14); // Zoom in for a better visual effect
            }

            // Display radar pulse at the pickup location
            updatePulsePosition(pickupCoords);

            // Save the trip request to Firestore
            const docRef = await addDoc(collection(db, "tripRequests"), {
                pickupLocation: pickupCoords,
                destination: destinationCoords,
                offer: finalOffer,
                transportationMode: selectedMode,
                clientId: "client123", // Replace with dynamic client ID if available
                status: "pending", // Mark the trip as pending initially
                createdAt: serverTimestamp(),
            });

            console.log("Trip request submitted with ID: ", docRef.id);
            toast.success("Your request has been submitted!");
            // Optionally, update the base price state
            setBasePrice(finalOffer);
            setTripRequestId(docRef.id); // Save the trip request ID for further use


        } catch (error) {
            console.error("Error submitting request: ", error);

            // Network error handling
            if (error.code === 'unavailable') {
                toast.error("Network error! Please check your connection and try again.");
            } else {
                toast.error("Failed to submit your request. Please try again.");
            }
            toast.error('Error');
            toast.info("Failed to submit your request. Please try again.");
            setIsSearching(false); // Stop the search in case of an error
            setShowWaitingModal(false); // Hide the waiting modal if submission fails
        }
    };

    // Function to close the waiting modal
    const handleCancelSearch = () => {
        setIsSearching(false);
        setShowWaitingModal(false);
    };


    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={googleMapsLibraries}>
            {/* Inject the radar keyframes into the page */}
            <style>{styles}</style>

            <Box sx={{ height: "100vh", width: "100vw", overflow: "auto", position: "relative" }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "white",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: 2,
                        padding: 2,
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <Autocomplete
                        onLoad={(autocomplete) => (pickupRef.current = autocomplete)}
                        onPlaceChanged={() =>
                            handlePlaceChanged(pickupRef.current, setPickupCoords, setPickup)
                        }
                    >
                        <TextField
                            label="Pickup Location"
                            variant="outlined"
                            size="small"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            sx={{ width: 250 }}
                            InputProps={{
                                endAdornment: (
                                    <LocationOnIcon
                                        sx={{ color: "#28A745", cursor: "pointer", mr: 1 }}
                                    />
                                ),
                            }}
                        />
                    </Autocomplete>

                    <Autocomplete
                        onLoad={(autocomplete) => (destinationRef.current = autocomplete)}
                        onPlaceChanged={() =>
                            handlePlaceChanged(destinationRef.current, setDestinationCoords, setDestination)
                        }
                    >
                        <TextField
                            label="Destination"
                            variant="outlined"
                            size="small"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            sx={{ width: 250 }}
                        />
                    </Autocomplete>

                    <Button variant="contained" onClick={handleConfirm} disabled={!isConfirmEnabled}>
                        Confirm
                    </Button>

                    <Button variant="contained" onClick={() => setModalOpen(true)} disabled={!isSearchEnabled}>
                        Search
                    </Button>

                    <Button variant="text" onClick={() => mapRef.current?.panTo(currentLocation)}>
                        <NearMeIcon color="error" />
                    </Button>

                    {isSearching && (
                        <Button variant="contained" onClick={stopSearch} color="error">
                            Cancel
                        </Button>
                    )}
                </Box>

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={currentLocation || { lat: 6.5244, lng: 3.3792 }}
                    zoom={12}
                    onLoad={(map) => (mapRef.current = map)}
                >
                    {currentLocation && <Marker position={currentLocation} label="You" />}
                    {destinationCoords && <Marker position={destinationCoords} label="Destination" />}
                    {directions && <DirectionsRenderer directions={directions} />}
                    {isSearching && <Box sx={radarPulse} />}
                </GoogleMap>

                <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle
                        sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "2rem",
                            color: "#0D47A1",
                            letterSpacing: 1
                        }}>
                        Trip Summary
                    </DialogTitle>

                    <DialogContent>
                        {/* Trip Details Section */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                                backgroundColor: "#E3F2FD",
                                borderRadius: 4,
                                p: 4,
                                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <LocationOnIcon sx={{ fontSize: 50, color: "#4CAF50" }} />
                                <Typography variant="h6" sx={{ fontWeight: "600", flex: 1, color: "#1565C0" }}>
                                    From: <span>{pickup}</span>
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <NearMeIcon sx={{ fontSize: 50, color: "#FF1744" }} />
                                <Typography variant="h6" sx={{ fontWeight: "600", flex: 1, color: "#FF5252" }}>
                                    To: <span>{destination}</span>
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 2,
                                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)"
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#37474F" }}>
                                    Distance:
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#0277BD", fontWeight: "bold" }}>
                                    {distance}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    p: 2,
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 2,
                                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)"
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: "bold", color: "#37474F" }}>
                                    Estimated Time:
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#FFA000", fontWeight: "bold" }}>
                                    {duration}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Transport Mode Selection */}
                        <Typography variant="h6" sx={{ textAlign: "center", mt: 4, mb: 2 }}>
                            Select Your Mode of Transport
                        </Typography>

                        <Grid
                            container
                            spacing={2}
                            justifyContent="space-around"
                            alignItems="center"
                            sx={{ mt: 2 }}
                        >
                            {["Car", "Bus", "Keke-Napep"].map((mode) => (
                                <Grid item xs={4} key={mode} sx={{ display: "flex", justifyContent: "center" }}>
                                    <Card
                                        onClick={() => setSelectedMode(mode)}
                                        sx={{
                                            cursor: "pointer",
                                            border: selectedMode === mode ? "3px solid #42A5F5" : "1px solid #ddd",
                                            transition: "0.3s",
                                            "&:hover": { boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
                                            width: "100%",
                                            maxWidth: 150,
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: "center" }}>
                                            <Avatar
                                                src={`/${mode.toLowerCase()}.svg`}
                                                sx={{ width: 50, height: 50, margin: "auto" }}
                                            />
                                            <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                                                {mode}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>


                        {/* Offer Adjustment Section */}
                        <Typography
                            variant="h6"
                            sx={{ textAlign: "center", mt: 4, color: "#0D47A1" }}
                        >
                            Your Estimated Price: ₦{basePrice}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                                gap: 2
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => handleSendOffer(basePrice - 100)}
                                disabled={basePrice <= 300}
                                sx={{
                                    color: "#FF1744",
                                    borderColor: "#FF1744",
                                    "&:hover": { backgroundColor: "rgba(255, 23, 68, 0.1)" }
                                }}
                            >
                                - ₦100
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => handleSendOffer(basePrice + 100)}
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
                            onClick={() => handleConfirmAndSearch(basePrice)}
                            sx={{
                                mt: 4,
                                width: "100%",
                                backgroundColor: "#007BFF",
                                "&:hover": { backgroundColor: "#0056b3" },
                            }}
                            disabled={!selectedMode}
                        >
                            Confirm and Search
                        </Button>
                    </DialogContent>
                </Dialog>

                // In your JSX, render the WaitingModal if showWaitingModal is true
                {showWaitingModal && (
                    <WaitingModal
                        tripRequestId={tripRequestId}
                        onCancel={handleCancelSearch}
                    />
                )}

            </Box>

        </LoadScript>
    );
}

export default RideBookingMap;