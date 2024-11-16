"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
    DirectionsRenderer,
} from "@react-google-maps/api";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    FormControl,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Card,
    CardContent,
    Avatar,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NearMeIcon from "@mui/icons-material/NearMe";
import { googleMapsLibraries } from "@/server/googleMaps/googleMapsConfig";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { addDoc, updateDoc, serverTimestamp, getFirestore, collection, query, where, onSnapshot, doc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import WaitingModal from "@/components/Client/RideBookingMap/WaitingModal";
import ClientRideConfirmationModal from "@/components/Client/RideBookingMap/ClientRideConfirmationModal";
import { useRouter } from "next/navigation";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    height: "100%",
    width: "100%",
};

const LoadingScreen = () => (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: 'linear-gradient(to right, #232526, #414345)' }}>
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: "#FFF" }}>Loading map, please wait...</Typography>
    </Box>
);

function RideBookingMap({ clientProfile }) {
    const { control } = useForm();
    const [mapLoading, setMapLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [searchLocation, setSearchLocation] = useState("");
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [selectedMode, setSelectedMode] = useState(null);
    const [basePrice, setBasePrice] = useState(0);
    const [tripRequestId, setTripRequestId] = useState(localStorage.getItem("tripRequestId") || null);
    const [searchActive, setSearchActive] = useState(Boolean(tripRequestId));
    const [showWaitingModal, setShowWaitingModal] = useState(searchActive); // Control modal visibility
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [driverDetails, setDriverDetails] = useState(null);
    const [tripDetails, setTripDetails] = useState(null);
    const router = useRouter();


    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);
    const destinationAutocompleteRef = useRef(null);

    useEffect(() => {
        if (clientProfile?.addresses?.length > 0) {
            const defaultAddress = clientProfile.addresses[0];
            const location = { lat: defaultAddress.latitude, lng: defaultAddress.longitude, formatted_address: defaultAddress.locationName };
            setMapCenter(location);
            setCurrentLocation(location);
            setSelectedAddress(defaultAddress.locationName);
            setSearchLocation(`${defaultAddress.category}: ${defaultAddress.locationName}`);
        }
    }, [clientProfile]);

    // Listen for changes in the Firestore document only if a search is active
    useEffect(() => {
        if (tripRequestId) {
            const tripRef = doc(db, "tripRequests", tripRequestId);
            const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
                const tripData = docSnapshot.data();
                if (tripData && tripData.status === "accepted") {
                    setShowWaitingModal(true);
                    toast.success("A driver has accepted your request!");
                }
            });

            return () => unsubscribe();
        }
    }, [tripRequestId]);

    useEffect(() => {
        if (tripRequestId) {
            const tripRef = doc(db, "tripRequests", tripRequestId);
            const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const tripData = docSnapshot.data();

                    // Show a toast notification for declined messages
                    if (tripData.message && tripData.status === "declined") {
                        toast.error(tripData.message); // Notify the client
                    }

                    // Handle other trip status changes (e.g., accepted)
                    if (tripData.status === "accepted") {
                        setShowWaitingModal(true);
                        toast.success("A driver has accepted your request!");
                    }
                }
            });

            return () => unsubscribe();
        }
    }, [tripRequestId]);

    useEffect(() => {
        if (!tripRequestId) return;

        const tripRef = doc(db, "tripRequests", tripRequestId);

        const unsubscribe = onSnapshot(tripRef, (docSnapshot) => {
            if (!docSnapshot.exists()) return;

            const tripData = docSnapshot.data();

            // When the driver accepts
            if (tripData.status === "accepted" && tripData.driverDetails) {
                setDriverDetails(tripData.driverDetails); // Capture driver details
                setTripDetails(tripData); // Capture trip details
                setShowConfirmationModal(true); // Open the confirmation modal
            }
        });

        return () => unsubscribe();
    }, [tripRequestId]);


    const handleMapLoad = (map) => {
        mapRef.current = map;
        setMapLoading(false);
    };

    const calculatePrice = (distance, duration) => {
        const baseFare = 300;
        const pricePerKm = 50;
        const pricePerMin = 20;

        const distanceValue = parseFloat(distance.replace(" km", ""));
        const durationValue = parseInt(duration.replace(" mins", ""));

        return baseFare + (distanceValue * pricePerKm) + (durationValue * pricePerMin);
    };

    const handleAddressSelect = (locationName) => {
        const address = clientProfile.addresses.find(addr => addr.locationName === locationName);
        if (address) {
            const location = { lat: address.latitude, lng: address.longitude, formatted_address: address.locationName };
            setSelectedAddress(locationName);
            setCurrentLocation(location);
            setIsConfirmEnabled(Boolean(location && destinationLocation));
            mapRef.current?.panTo(location);
        }
    };

    const handleSourcePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                formatted_address: place.formatted_address // Capture the formatted address for source
            };
            setCurrentLocation(location); // Update the source location state
            setSearchLocation(place.formatted_address); // Set the text field value for source
            setIsConfirmEnabled(Boolean(location && destinationLocation));
        } else {
            toast.error("Please select a location from the suggestions.");
        }
    };

    const handleDestinationPlaceChanged = () => {
        const place = destinationAutocompleteRef.current.getPlace();
        if (place.geometry) {
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                formatted_address: place.formatted_address // Capture the formatted address for destination
            };
            setDestinationLocation(location); // Update the destination location state
            setIsConfirmEnabled(Boolean(currentLocation && location));
        } else {
            toast.error("Please select a location from the suggestions.");
        }
    };

    const handleConfirmLocation = () => {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: destinationLocation,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    const route = result.routes[0].legs[0];
                    setDistance(route.distance.text);
                    setDuration(route.duration.text);
                    setBasePrice(calculatePrice(route.distance.text, route.duration.text));
                } else {
                    toast.error("Unable to calculate route. Try another location.");
                }
            }
        );
    };

    const handleConfirmAndSearch = async (finalOffer) => {
        if (!currentLocation || !destinationLocation || !selectedMode) {
            toast.error('lease fill all the required fields.');
            return;
        }

        try {
            setIsModalOpen(false);
            setShowWaitingModal(true);

            // Extract state from pickup and destination locations

            const docRef = await addDoc(collection(db, "tripRequests"), {
                pickupLocation: currentLocation,
                destinationLocation: destinationLocation,
                offer: finalOffer,
                transportationMode: selectedMode,
                clientId: clientProfile._id,
                status: "pending",
                createdAt: serverTimestamp(),
                country: "Nigeria", // Fixed value for location
                searchRadius: 5, // Example: 5 km radius for nearby driver search
                distance,
                duration,
            });

            console.log("Trip request submitted with ID: ", docRef.id);

            toast.success("Your request has been submitted!");
            setTripRequestId(docRef.id);

        } catch (error) {
            console.error("Error submitting request: ", error);
            toast.error("Failed to submit your request. Please try again.");
            setShowWaitingModal(false);
        }
    };


    const handleSendOffer = (newOffer) => {
        setBasePrice(newOffer); // Update the base price state
    };


    // Set tripRequestId in both state and localStorage when a search starts
    const startSearch = (id) => {
        setTripRequestId(id);
        localStorage.setItem("tripRequestId", id);
        setSearchActive(true);
        setShowWaitingModal(true);
    };

    const handleCancelSearch = () => {
        if (window.confirm("Are you sure you want to cancel this search?")) {
            // Update Firestore status to "cancelled"
            const tripRef = doc(db, "tripRequests", tripRequestId);
            updateDoc(tripRef, { status: "cancelled" });

            // Clean up
            setTripRequestId(null);
            localStorage.removeItem("tripRequestId");
            setSearchActive(false);
            setShowWaitingModal(false);
            toast.info("Search has been cancelled.");
        }
    };

    const closeWaitingModal = () => {
        setShowWaitingModal(false);
        localStorage.removeItem("tripRequestId");
    }

    const handleAcceptCounterOffer = async () => {
        if (!tripRequestId || !clientProfile) {
            toast.error("Missing trip details or client profile.");
            return;
        }

        try {
            // Fetch the trip details from Firestore
            const tripDoc = await getDoc(doc(db, "tripRequests", tripRequestId));
            if (!tripDoc.exists()) {
                toast.error("Trip request not found.");
                return;
            }
            const tripDetails = tripDoc.data(); // Retrieve the trip details

            // Update tripRequests with client details
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
                status: "client-accepted",
                clientDetails: {
                    name: clientProfile.fullName,
                    avatar: clientProfile.avatar,
                    phoneNumber: clientProfile.phoneNumber,
                    clientId: clientProfile._id,
                },
                finalOffer: tripDetails.counterOffer, // Accept the counter offer
                updatedAt: serverTimestamp(),
            });

            // Update clientRides
            const clientRideRef = doc(db, "clientRides", clientProfile._id, "rides", tripRequestId);
            await setDoc(clientRideRef, {
                rideId: tripRequestId,
                pickupLocation: tripDetails.pickupLocation,
                destinationLocation: tripDetails.destinationLocation,
                offer: tripDetails.counterOffer || tripDetails.basePrice,
                status: "client-accepted",
                driverDetails: tripDetails.driverDetails || null,
                clientDetails: {
                    name: clientProfile.fullName,
                    avatar: clientProfile.avatar,
                    phoneNumber: clientProfile.phoneNumber,
                    clientId: clientProfile._id,
                },
                createdAt: tripDetails.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            

            // Update state with trip details
            setTripDetails({ ...tripDetails, finalOffer: tripDetails.counterOffer });
            // Show confirmation modal
            setShowConfirmationModal(true);
            toast.success("Counter offer accepted! Awaiting final confirmation...");
            
        } catch (error) {
            console.error("Error accepting counter offer:", error);
            toast.error("Failed to accept the offer. Please try again.");
        }
    };


    const handleClientConfirmation = async () => {
        if (!tripRequestId || !clientProfile) {
            toast.error("Missing trip details or client profile.");
            return;
        }

        try {
            // Finalize the ride in tripRequests
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
                finalizedAt: serverTimestamp(), // Timestamp when the ride is confirmed
                status: "accepted-and-finalized", // Finalize the status
            });

            // Update clientRides
            const clientRideRef = doc(db, "clientRides", clientProfile._id, "rides", tripRequestId);
            await updateDoc(clientRideRef, {
                status: "finalized",
                updatedAt: serverTimestamp(),
            });

            toast.success("You have confirmed the ride!");
            setShowConfirmationModal(false); // Close the modal
            router.push("/user/my-rides"); // Redirect to My Rides page
        } catch (error) {
            console.error("Error confirming the ride:", error);
            toast.error("Failed to confirm the ride. Please try again.");
        }
    };



    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={googleMapsLibraries}>
            {mapLoading && <LoadingScreen />}

            <Box sx={{ height: "100vh", width: "100vw", overflow: "auto", position: "relative" }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "white",
                        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                        borderRadius: 2,
                        padding: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "flex-start",
                        zIndex: 1000,
                        width: "90%",
                        maxWidth: 1150,
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth sx={{ maxWidth: 500 }}>
                            <Controller
                                name="selectedAddress"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        value={selectedAddress}
                                        onChange={(e) => {
                                            const locationName = e.target.value;
                                            field.onChange(locationName);
                                            setSelectedAddress(locationName);
                                            handleAddressSelect(locationName);
                                            setSearchLocation("");
                                        }}
                                        label="Select Saved Location"
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            "& .MuiInputBase-input": { color: "#333" },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": { borderColor: "#ccc" },
                                                "&:hover fieldset": { borderColor: "#0d47a1" },
                                                "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                                            },
                                        }}
                                    >
                                        {clientProfile.addresses.map((address) => (
                                            <MenuItem key={address._id.$oid} value={address.locationName}>
                                                {address.locationName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </FormControl>

                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={() => handleSourcePlaceChanged(autocompleteRef, setCurrentLocation, setSelectedAddress)}
                        >
                            <TextField
                                label="Enter Location"
                                variant="outlined"
                                size="small"
                                value={searchLocation}
                                onChange={(e) => {
                                    setSearchLocation(e.target.value);
                                    setSelectedAddress("");
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: 600,
                                    backgroundColor: "#f5f5f5",
                                    "& .MuiInputBase-input": { color: "#333" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#ccc" },
                                        "&:hover fieldset": { borderColor: "#0d47a1" },
                                        "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <LocationOnIcon sx={{ color: "#0d47a1", cursor: "pointer", mr: 1 }} />
                                    ),
                                }}
                            />
                        </Autocomplete>
                    </Box>

                    <Divider sx={{ width: "100%", border: '2px solid grey' }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Autocomplete
                            onLoad={(autocomplete) => (destinationAutocompleteRef.current = autocomplete)}
                            onPlaceChanged={() => handleDestinationPlaceChanged(destinationAutocompleteRef, setDestinationLocation)}
                        >
                            <TextField
                                label="Enter Destination"
                                variant="outlined"
                                size="small"
                                value={destinationLocation ? destinationLocation.formatted_address : ""}
                                onChange={(e) => setDestinationLocation(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: 450,
                                    backgroundColor: "#f5f5f5",
                                    "& .MuiInputBase-input": { color: "#333" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#ccc" },
                                        "&:hover fieldset": { borderColor: "#0d47a1" },
                                        "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <LocationOnIcon sx={{ color: "#0d47a1", cursor: "pointer", mr: 1 }} />
                                    ),
                                }}
                            />
                        </Autocomplete>

                        <Button
                            variant="outlined"
                            onClick={() => mapRef.current?.panTo(currentLocation)}
                            sx={{
                                color: "#0d47a1",
                                borderColor: "#0d47a1",
                                minWidth: 120,
                                "&:hover": {
                                    borderColor: "#0d47a1",
                                    backgroundColor: "rgba(13, 71, 161, 0.1)",
                                },
                            }}
                        >
                            <NearMeIcon sx={{ mr: 1 }} />
                            Center
                        </Button>

                        {isConfirmEnabled && (
                            <Button
                                variant="contained"
                                onClick={handleConfirmLocation}
                                color="primary"
                                sx={{ minWidth: 120 }}
                            >
                                Confirm
                            </Button>
                        )}

                        {directions && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setIsModalOpen(true)}
                                sx={{ minWidth: 120 }}
                            >
                                Preview
                            </Button>
                        )}
                    </Box>
                </Box>

                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter || { lat: 6.5244, lng: 3.3792 }}
                    zoom={mapCenter ? 14 : 12}
                    onLoad={handleMapLoad}
                >
                    {currentLocation && <Marker position={currentLocation} />}
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>

                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle
                        sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "2rem",
                            color: "#0D47A1",
                            letterSpacing: 1,
                        }}
                    >
                        Trip Summary
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                                backgroundColor: "#E3F2FD",
                                borderRadius: 4,
                                p: 4,
                                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <LocationOnIcon sx={{ fontSize: 50, color: "#4CAF50" }} />
                                <Typography variant="h6" sx={{ fontWeight: "600", flex: 1, color: "#1565C0" }}>
                                    From: <span>{selectedAddress || searchLocation || "Current Location"}</span>
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <NearMeIcon sx={{ fontSize: 50, color: "#FF1744" }} />
                                <Typography variant="h6" sx={{ fontWeight: "600", flex: 1, color: "#FF5252" }}>
                                    To: <span>{destinationLocation?.formatted_address || "Destination"}</span>
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
                                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)",
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
                                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)",
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
                        <Typography variant="h6" sx={{ textAlign: "center", mt: 4, color: "#0D47A1" }}>
                            Your Estimated Price: ₦{basePrice}
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => handleSendOffer(basePrice - 100)}
                                disabled={basePrice <= 300}
                                sx={{
                                    color: "#FF1744",
                                    borderColor: "#FF1744",
                                    "&:hover": { backgroundColor: "rgba(255, 23, 68, 0.1)" },
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
                                    "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" },
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


                {/* Waiting Modal */}
                {showWaitingModal && (
                    <WaitingModal
                        tripRequestId={tripRequestId}
                        initialOffer={basePrice}  // Pass the initial offer here
                        onCancel={handleCancelSearch}
                        onMinimize={() => setShowWaitingModal(false)}
                        onAcceptCounterOffer={handleAcceptCounterOffer}
                        onClose={closeWaitingModal}
                    />
                )}

                {/* Button to reopen minimized modal if search is active */}
                {!showWaitingModal && searchActive && (
                    <button onClick={() => setShowWaitingModal(true)}>
                        Reopen Waiting Modal
                    </button>
                )}
                <ClientRideConfirmationModal
                    isOpen={showConfirmationModal}
                    onConfirm={handleClientConfirmation}
                    onCancel={() => setShowConfirmationModal(false)}
                    tripDetails={tripDetails} // Pass current trip details directly
                />
            </Box>
        </LoadScript>
    );
}

export default RideBookingMap;
