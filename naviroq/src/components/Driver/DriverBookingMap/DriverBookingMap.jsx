"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  Circle
} from "@react-google-maps/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NearMeIcon from "@mui/icons-material/NearMe";
import { googleMapsLibraries } from "@/server/googleMaps/googleMapsConfig";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";

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

function DriverBookingMap({ driverProfile }) {
  const { control } = useForm();
  const [listening, setListening] = useState(false); // To toggle listening status
  const [mapCenter, setMapCenter] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [pulseRadius, setPulseRadius] = useState(0); // Dynamic radius for pulse effect

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const pulseInterval = useRef(null); // To manage the pulse animation interval

  useEffect(() => {
    if (driverProfile?.addresses?.length > 0) {
      const defaultAddress = driverProfile.addresses[0];
      const location = { lat: defaultAddress.latitude, lng: defaultAddress.longitude };
      setMapCenter(location);
      setCurrentLocation(location);
      setSelectedAddress(defaultAddress.locationName);
      setMarkerPosition(location);
      setSearchLocation(`${defaultAddress.category}: ${defaultAddress.locationName}`);
    }
  }, [driverProfile]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    setMapLoading(false);
  };

  const handleAddressSelect = (locationName) => {
    const address = driverProfile.addresses.find(addr => addr.locationName === locationName);
    if (address) {
      const location = { lat: address.latitude, lng: address.longitude };
      setSelectedAddress(locationName);
      setCurrentLocation(location);
      setMarkerPosition(location);
      mapRef.current?.panTo(location);
      setSearchLocation("");
      setShowConfirm(false);
    }
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setSearchLocation(place.formatted_address);
      setSelectedAddress("");
      setCurrentLocation(location);
      setMarkerPosition(location);
      setShowConfirm(true);
    } else {
      toast.error("Please select a location from the suggestions.");
    }
  };

  const handleConfirmLocation = () => {
    mapRef.current?.panTo(currentLocation);
    setMarkerPosition(currentLocation);
    setShowConfirm(false);
    setSelectedAddress("");
    toast.success("Location set successfully!");
  };

  // Radar pulse effect for listening mode
  useEffect(() => {
    if (listening) {
      pulseInterval.current = setInterval(() => {
        setPulseRadius((prevRadius) => (prevRadius < 2000 ? prevRadius + 100 : 0));
      }, 100); // Controls the pulse speed and reset
    } else {
      clearInterval(pulseInterval.current);
      setPulseRadius(0); // Reset radius when not listening
    }

    return () => clearInterval(pulseInterval.current);
  }, [listening]);

  const handleListenToggle = () => {
    setListening((prev) => !prev);
    toast.info(listening ? "Stopped listening for requests" : "Listening for requests...");
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
            gap: 2,
            alignItems: "center",
            zIndex: 1000,
            width: "90%",
            maxWidth: 1200,
          }}
        >
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
                  }}
                  label="Select Saved Location"
                  variant="outlined"
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
                  {driverProfile.addresses.map((address) => (
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
            onPlaceChanged={handlePlaceChanged}
          >
            <TextField
              label="Enter Location"
              variant="outlined"
              size="small"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              sx={{
                width: 500,
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

          {showConfirm && (
            <Button
              variant="contained"
              onClick={handleConfirmLocation}
              color="primary"
              sx={{ minWidth: 120 }}
            >
              Confirm
            </Button>
          )}

          <Button
            variant={listening ? "contained" : "outlined"}
            color={listening ? "secondary" : "primary"}
            onClick={handleListenToggle}
            sx={{ minWidth: 140 }}
          >
            {listening ? "Stop" : "Listen"}
          </Button>
        </Box>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter || { lat: 6.5244, lng: 3.3792 }}
          zoom={mapCenter ? 14 : 12}
          onLoad={handleMapLoad}
          onUnmount={() => setMapLoading(true)}
        >
          {markerPosition && (
            <>
              <Marker
                position={markerPosition}
                icon={{
                  url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
                }}
              />
              {listening && (
                <Circle
                  center={markerPosition}
                  radius={pulseRadius}
                  options={{
                    fillColor: "rgba(255, 0, 0, 0.2)",
                    strokeColor: "rgba(255, 0, 0, 0.5)",
                    strokeWeight: 1,
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </Box>
    </LoadScript>
  );
}

export default DriverBookingMap;
