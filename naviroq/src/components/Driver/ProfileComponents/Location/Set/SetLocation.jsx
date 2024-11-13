'use client';
import { useState, useEffect, useRef } from "react";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
} from "@react-google-maps/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { setLoctionValidator } from "@/validators/locationValidator";
import AdminUtils from "@/utils/AdminUtils";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { googleMapsLibraries } from "@/server/googleMaps/googleMapsConfig";
import { CircularProgress } from "@mui/material";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const locationCategory = ["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"];

const mapContainerStyle = {
    flexGrow: 1,
    width: "100%",
};

function SetLocation({ driverProfile }) {
    const [isLoading, setIsLoading] = useState(false);
    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        mode: "onTouched",
        resolver: zodResolver(setLoctionValidator),
        reValidateMode: "onChange",
    });

    const queryClient = useQueryClient()

    const initialLocation = driverProfile.addresses?.[0]
        ? { lat: driverProfile.addresses[0].latitude, lng: driverProfile.addresses[0].longitude }
        : { lat: 6.5244, lng: 3.3792 };

    const [currentLocation, setCurrentLocation] = useState(initialLocation);
    const [locationCoords, setLocationCoords] = useState(null);
    const [savedLocations, setSavedLocations] = useState(driverProfile.addresses || []);
    const [showDashboardButton, setShowDashboardButton] = useState(savedLocations.length > 0);
    const [isLocationFieldEnabled, setIsLocationFieldEnabled] = useState(false);
    const mapRef = useRef(null);
    const locationRef = useRef(null);
    const router = useRouter();

    const theme = useTheme();
    const xs = useMediaQuery(theme.breakpoints.down("xs"));
    const sm = useMediaQuery(theme.breakpoints.down("sm"));

    const mutationUpdate = useMutation({
        mutationKey: ["setClientLocation"],
        mutationFn: AdminUtils.setClientLocation,
    });

    useEffect(() => {
        if (currentLocation && mapRef.current) {
            mapRef.current.panTo(currentLocation);
        }
    }, [currentLocation]);

    const handlePlaceChanged = () => {
        const place = locationRef.current.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            const coords = { latitude: location.lat(), longitude: location.lng() };
            setLocationCoords(coords);
            setValue("locationCoords", coords);
            setValue("locationName", place.formatted_address);
            mapRef.current?.panTo(coords);
            mapRef.current?.setZoom(14);
            toast.success("Location set successfully!");
        }
    };

    const handleCategoryChange = (value) => {
        setValue("category", value);
        setIsLocationFieldEnabled(!!value);
    };

    const handleSetLocation = (objData) => {
        setIsLoading(true);
        const newLocation = {
            ...objData,
            locationCoords
        };

        if (!locationCoords) {
            toast.error("Please select a location from the suggestions.");
            setIsLoading(false);
            return;
        }

        const { success, data } = setLoctionValidator.safeParse(newLocation);
        if (!success) {
            toast.error("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }
        console.log({ data });

        mutationUpdate.mutate(data, {
            onSuccess: (response) => {
                setSavedLocations(response.addresses);
                setShowDashboardButton(response.addresses.length > 0);
                setIsLocationFieldEnabled(false);
                setValue("category", "");
                setValue("locationName", "");
                setValue("description", "");
                setValue("locationCoords", null);
                toast.success("Location saved successfully!");
                setIsLoading(false);
                queryClient.invalidateQueries({ queryKey: ["DriverData"] });

            },
            onError: (error) => {
                toast.error("Error saving location. Please try again.");
                setIsLoading(false);
                console.error("Error saving location:", error);
            },
        });
    };

    if (Object.keys(errors).length > 0) {
        console.log({ errors });
    }

    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={googleMapsLibraries}>
            <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <Box
                    component={"form"}
                    onSubmit={handleSubmit(handleSetLocation)}
                    noValidate
                    autoComplete="off"
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        boxShadow: 2,
                        zIndex: 1000,
                    }}
                >
                    <Grid container spacing={2} columns={12} sx={{ width: "100%", alignItems: "center" }}>
                        <Grid item size={12}>
                            <Card sx={{
                                background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                padding: '16px',
                                borderRadius: '10px',
                            }}>
                                <Typography variant="body1"
                                    sx={{
                                        color: '#FFF',
                                        fontSize: xs ? '0.8rem' : sm ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold',
                                        textAlign: 'left'
                                    }}>
                                    Set and save your location, you can save multiple locations one at a time.
                                </Typography>
                            </Card>
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 2 }}>
                            <Controller
                                name="category"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Location Category"
                                        fullWidth
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        error={!!errors.category}
                                        helperText={errors.category ? errors.category.message : ""}
                                    >
                                        {locationCategory.map((cat) => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 3.5 }}>
                            <Controller
                                name="locationName"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        onLoad={(autocomplete) => (locationRef.current = autocomplete)}
                                        onPlaceChanged={handlePlaceChanged}
                                    >
                                        <TextField
                                            {...field}
                                            label="Location"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            error={!!errors.locationName}
                                            helperText={errors.locationName ? errors.locationName.message : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <LocationOnIcon sx={{ color: "#28A745", cursor: "pointer" }} />
                                                ),
                                            }}
                                            disabled={!isLocationFieldEnabled}
                                        />
                                    </Autocomplete>
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 3.5 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Description (Optional)"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 1.5 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={isLoading ?<CircularProgress size={20} /> : <LocationOnIcon />}
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Location'}
                            </Button>
                        </Grid>

                        {showDashboardButton && (
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 1.5 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<DashboardIcon />}
                                    onClick={() => router.push("/user/dashboard")}
                                    fullWidth
                                >
                                    Dashboard
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Map Section */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={currentLocation}
                    zoom={12}
                    onLoad={(map) => (mapRef.current = map)}
                >
                    {/* Initial Pin at Center */}
                    {currentLocation && (
                        <Marker
                            position={currentLocation}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                            }}
                        />
                    )}
                    {locationCoords && (
                        <Marker
                            position={locationCoords}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                            }}
                        />
                    )}
                </GoogleMap>
            </Box>
        </LoadScript>
    );
}

export default SetLocation;
