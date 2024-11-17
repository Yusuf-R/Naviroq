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
  Modal,

} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NearMeIcon from "@mui/icons-material/NearMe";
import { googleMapsLibraries } from "@/server/googleMaps/googleMapsConfig";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc, Timestamp, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { db } from "@/server/database/firebaseConfig";
import RideRequestModal from "@/components/Driver/DriverBookingMap/RideRequestModal";
import { addDoc, serverTimestamp } from "firebase/firestore";
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
  const [nearbyRides, setNearbyRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null); // Define selectedRide state

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const pulseInterval = useRef(null); // To manage the pulse animation interval

  const router = useRouter();

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
      const location = { lat: address.latitude, lng: address.longitude, formatted_address: address.locationName };
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


  // useEffect(() => {
  //   if (!driverProfile?._id || !selectedRide) return;

  //   const tripRef = doc(db, "tripRequests", selectedRide.id); // Reference the tripRequestId
  //   const tripRequestId = selectedRide.id;

  //   const unsubscribe = onSnapshot(tripRef, async (docSnapshot) => {
  //     if (docSnapshot.exists()) {
  //       const tripData = docSnapshot.data();
  //       console.log({ tripData });

  //       // Handle client acceptance
  //       if (tripData.status === "client-accepted" && tripData.clientDetails) {
  //         toast.info(`Client ${tripData.clientDetails.name} has accepted the ride!`);

  //         // Add driver details to the tripRequests document if missing
  //         if (!tripData.driverDetails) {
  //           await updateDoc(doc(db, "tripRequests", tripRequestId), {
  //             driverDetails: {
  //               name: driverProfile.fullName,
  //               avatar: driverProfile.avatar,
  //               phoneNumber: driverProfile.phoneNumber,
  //               vehicleType: driverProfile.vehicleType,
  //               vehiclePlateNumber: driverProfile.vehiclePlateNumber,
  //             },
  //             updatedAt: serverTimestamp(),
  //           });
  //         }

  //         // Update driver's ride history
  //         const driverRideRef = doc(db, "driverRides", driverProfile._id, "rides", tripRequestId);
  //         await setDoc(driverRideRef, {
  //           rideId: tripRequestId,
  //           pickupLocation: tripData.pickupLocation,
  //           destinationLocation: tripData.destinationLocation,
  //           offer: tripData.finalOffer || tripData.basePrice,
  //           status: "client-accepted",
  //           clientDetails: tripData.clientDetails,
  //           driverDetails: {
  //             name: driverProfile.fullName,
  //             avatar: driverProfile.avatar,
  //             phoneNumber: driverProfile.phoneNumber,
  //             vehicleType: driverProfile.vehicleType,
  //             vehiclePlateNumber: driverProfile.vehiclePlateNumber,
  //           },
  //           createdAt: tripData.createdAt || serverTimestamp(),
  //           updatedAt: serverTimestamp(),
  //         });

  //         // Update client's ride history
  //         const clientRideRef = doc(db, "clientRides", tripData.clientDetails.clientId, "rides", tripRequestId);
  //         await setDoc(clientRideRef, {
  //           rideId: tripRequestId,
  //           pickupLocation: tripData.pickupLocation,
  //           destinationLocation: tripData.destinationLocation,
  //           offer: tripData.finalOffer || tripData.basePrice,
  //           status: "client-accepted",
  //           clientDetails: tripData.clientDetails,
  //           driverDetails: {
  //             name: driverProfile.fullName,
  //             avatar: driverProfile.avatar,
  //             phoneNumber: driverProfile.phoneNumber,
  //             vehicleType: driverProfile.vehicleType,
  //             vehiclePlateNumber: driverProfile.vehiclePlateNumber,
  //           },
  //           createdAt: tripData.createdAt || serverTimestamp(),
  //           updatedAt: serverTimestamp(),
  //         });
  //       }

  //       // Handle ride finalization
  //       if (tripData.status === "accepted-and-finalized") {
  //         toast.success("The client has finalized the ride!");
  //         setSelectedRide(null);

  //         // Update driver's ride history with finalized status
  //         const driverRideRef = doc(db, "driverRides", driverProfile._id, "rides", tripRequestId);
  //         await updateDoc(driverRideRef, {
  //           status: "finalized",
  //           updatedAt: serverTimestamp(),
  //         });

  //         // Update client's ride history with finalized status
  //         const clientRideRef = doc(db, "clientRides", tripData.clientDetails.clientId, "rides", tripRequestId);
  //         await updateDoc(clientRideRef, {
  //           status: "finalized",
  //           updatedAt: serverTimestamp(),
  //         });

  //         router.push("/driver/my-rides"); // Redirect to My Rides
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [driverProfile, selectedRide]);


  useEffect(() => {
    if (!driverProfile?._id || !selectedRide) return;

    const tripRef = doc(db, "tripRequests", selectedRide.id); // Reference the tripRequestId
    const tripRequestId = selectedRide.id;

    const unsubscribe = onSnapshot(tripRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const tripData = docSnapshot.data();

        // Handle client acceptance
        if (tripData.status === "client-accepted" && tripData.clientDetails) {
          toast.info(`Client ${tripData.clientDetails.name} has accepted the ride!`);

          // Add driver details to the tripRequests document if missing
          if (!tripData.driverDetails) {
            await updateDoc(doc(db, "tripRequests", tripRequestId), {
              driverDetails: {
                name: driverProfile.fullName,
                avatar: driverProfile.avatar,
                phoneNumber: driverProfile.phoneNumber,
                vehicleType: driverProfile.vehicleType,
                vehiclePlateNumber: driverProfile.vehiclePlateNumber,
                driverId: driverProfile._id,
              },
              updatedAt: serverTimestamp(),
            });
          }

          // Update driver's ride history
          const driverRideRef = doc(db, "driverRides", driverProfile._id, "rides", tripRequestId);
          await setDoc(driverRideRef, {
            rideId: tripRequestId,
            pickupLocation: tripData.pickupLocation,
            destinationLocation: tripData.destinationLocation,
            offer: tripData.finalOffer || tripData.basePrice,
            status: "client-accepted",
            clientDetails: tripData.clientDetails,
            driverDetails: {
              name: driverProfile.fullName,
              avatar: driverProfile.avatar || '/av-3.svg',
              phoneNumber: driverProfile.phoneNumber,
              vehicleType: driverProfile.vehicleType,
              vehiclePlateNumber: driverProfile.vehiclePlateNumber,
              driverId: driverProfile._id,
            },
            createdAt: tripData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        //  Handle ride finalization
        if (tripData.status === "accepted-and-finalized") {
          toast.success("The client has finalized the ride!");
          setSelectedRide(null);

          // Update driver's ride history with finalized status
          const driverRideRef = doc(db, "driverRides", driverProfile._id, "rides", tripRequestId);
          await updateDoc(driverRideRef, {
            status: "finalized",
            updatedAt: serverTimestamp(),
          });

        }
      }
    });
    return () => unsubscribe();
  }, [driverProfile, selectedRide]);



  const startListeningForNearbyRides = () => {
    if (!currentLocation || !driverProfile?.vehicleType) {
      console.error("Location or transportation mode is undefined.");
      return;
    }

    const db = getFirestore();
    const maxRadius = 5000; // 5 km radius
    const driverLocation = { lat: currentLocation.lat, lng: currentLocation.lng };
    const driverLocationArray = [driverLocation.lat, driverLocation.lng]; // Convert location to array format
    const transportationMode = driverProfile.vehicleType;

    // Step 1: Simple Query Without DeclinedOffers Filtering
    const simpleQuery = query(
      collection(db, "tripRequests"),
      where("transportationMode", "==", transportationMode),
      where("status", "in", ["pending", "negotiation"]) // Include only active requests
    );

    const unsubscribeSimpleQuery = onSnapshot(simpleQuery, (snapshot) => {
      const simpleMatchedRides = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter rides by distance and declined offers
      const filteredRides = simpleMatchedRides.filter((ride) => {
        const declined = (ride.declinedOffers || []).includes(driverProfile._id);
        const canRetry =
          !ride.retryAllowedAt ||
          ride.retryAllowedAt <= Timestamp.now().toDate().getTime(); // Check if retry is allowed
        return !declined || canRetry;
      });

      if (filteredRides.length > 0) {
        setNearbyRides(filteredRides);
        console.log("Filtered rides:", filteredRides);
      } else {
        console.log("No rides found with the current filtering logic. Trying geohash bounds...");

        // Step 2: Reintroduce Geohash Bounds
        const bounds = geohashQueryBounds(driverLocationArray, maxRadius);
        const unsubscribeBoundsList = bounds.map((b) => {
          const boundQuery = query(
            collection(db, "tripRequests"),
            where("geohash", ">=", b[0]),
            where("geohash", "<=", b[1]),
            where("transportationMode", "==", transportationMode),
            where("status", "in", ["pending", "negotiation"]) // Include only active requests
          );

          // Real-time Firestore listener with geohash bounds
          return onSnapshot(boundQuery, (snapshot) => {
            const boundMatchedRides = snapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((ride) => {
                const distance = distanceBetween(driverLocationArray, [
                  ride.pickupLocation.lat,
                  ride.pickupLocation.lng,
                ]);

                // Exclude rides this driver declined and filter by distance
                return distance <= maxRadius && !(ride.declinedOffers || []).includes(driverProfile._id);
              });

            if (boundMatchedRides.length > 0) {
              setNearbyRides((prevRides) => [...prevRides, ...boundMatchedRides]);
              console.log("Filtered rides with geohash bounds:", boundMatchedRides);
            }
          });
        });

        // Unsubscribe function for bounded queries
        return () => unsubscribeBoundsList.forEach((unsubscribe) => unsubscribe());
      }
    });

    // Unsubscribe function for the simple query
    return () => unsubscribeSimpleQuery();
  };

  const handleListenToggle = () => {
    setListening((prev) => !prev);
    if (!listening) {
      const stopListening = startListeningForNearbyRides();
      return stopListening;
    } else {
      setNearbyRides([]);
    }
    toast.info(listening ? "Stopped listening for requests" : "Listening for requests...");
  };

  const handleAcceptRequest = async (rideId) => {
    if (!rideId) {
      toast.error("Invalid ride ID. Please refresh and try again.");
      return;
    }

    if (!driverProfile?._id) {
      toast.error("Driver profile is missing or incomplete.");
      return;
    }

    try {
      // Fetch the ride details from Firestore
      const rideDoc = await getDoc(doc(db, "tripRequests", rideId));
      if (!rideDoc.exists()) {
        toast.error("Ride request not found.");
        return;
      }

      const ride = rideDoc.data(); // Retrieve ride data

      // Update the `tripRequests` document with driver details
      await updateDoc(doc(db, "tripRequests", rideId), {
        status: "awaiting-client-confirmation", // New status for client confirmation
        driverId: driverProfile._id,
        driverDetails: {
          name: driverProfile.fullName,
          avatar: driverProfile.avatar,
          vehicleType: driverProfile.vehicleType,
          vehiclePlateNumber: driverProfile.vehiclePlateNumber,
        },
        acceptedAt: serverTimestamp(),
      });

      toast.success("You have accepted the ride request. Waiting for client confirmation.");
      setSelectedRide(null); // Clear the ride after acceptance
    } catch (error) {
      console.error("Error accepting the ride request:", error);
      toast.error("Failed to accept the ride. Please try again.");
    }
  };



  const handleMarkerClick = (ride) => {
    setSelectedRide({
      ...ride,
      driverId: driverProfile._id, // Attach driverId to the ride
    });
  };

  const handleDeclineRequest = async (ride) => {
    console.log({ ride });
    if (!ride || !ride.driverId) {
      toast.error("Driver ID is missing for the selected ride.");
      return;
    }

    try {
      const retryAfter = new Date();
      retryAfter.setMinutes(retryAfter.getMinutes() + 1);

      // Update Firestore with the decline details
      await updateDoc(doc(db, "tripRequests", ride.id), {
        declinedOffers: arrayUnion(ride.driverId),
        retryAllowedAt: retryAfter.getTime(),
        message: "Driver declined the offer.",
        status: "declined",
      });

      toast.info("You declined the client's offer. You can retry after 1 minute.");
      setSelectedRide(null); // Clear the selected ride
    } catch (error) {
      console.error("Error declining client offer:", error);
      toast.error("Failed to decline the offer.");
    }
  };

  const handleCounterOfferSubmit = async (requestId, counterOffer) => {
    if (!counterOffer || counterOffer <= 0) {
      toast.error("Please enter a valid counter offer.");
      return;
    }
    try {
      await updateDoc(doc(db, "tripRequests", requestId), {
        status: "countered",
        counterOffer: counterOffer,
        driverId: driverProfile._id,
        driverDetails: {
          name: driverProfile.fullName,
          avatar: driverProfile.avatar,
          vehicleType: driverProfile.vehicleType,
          vehiclePlateNumber: driverProfile.vehiclePlateNumber,
          driverId: driverProfile._id,
        },
        source: "driver",
      });
      toast.success("Counter offer submitted successfully!");
    } catch (error) {
      console.error("Error submitting counter offer:", error); // Debug log
      toast.error("Failed to submit counter offer.");
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedRide(null);
  };

  const fetchRouteToPickup = (driverLocation, pickupLocation) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: driverLocation,
        destination: pickupLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result); // Update state to render the route
          const route = result.routes[0].legs[0];
          setEta(route.duration.text); // Set ETA
        } else {
          toast.error("Failed to calculate the route.");
        }
      }
    );
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

          {nearbyRides.map((ride) => (
            <Marker
              key={ride.id}
              position={{
                lat: ride.pickupLocation.lat,
                lng: ride.pickupLocation.lng,
              }}
              label="Ride Request"
            />
          ))}

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
                <>
                  {/* Radar Pulse Effect */}
                  <Circle
                    center={markerPosition}
                    radius={pulseRadius}
                    options={{
                      fillColor: "rgba(255, 0, 0, 0.2)",
                      strokeColor: "rgba(255, 0, 0, 0.5)",
                      strokeWeight: 1,
                    }}
                  />

                  {/* Nearby Ride Markers */}
                  {nearbyRides.map((ride) => (
                    <Marker
                      key={ride.id}
                      position={{
                        lat: ride.pickupLocation.lat,
                        lng: ride.pickupLocation.lng,
                      }}
                      label="Ride Request"
                      icon={{
                        url: "https://maps.google.com/mapfiles/kml/shapes/man.png",
                      }}
                      onClick={() => handleMarkerClick(ride)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </GoogleMap>

        <RideRequestModal
          selectedRide={selectedRide}
          onAccept={handleAcceptRequest}
          onCounterOffer={handleCounterOfferSubmit} // Attach counter handler here
          onDecline={(ride) => handleDeclineRequest(ride)} // Pass the selected ride explicitly
          onClose={handleCloseModal}
        />

      </Box>
    </LoadScript>
  );
}

export default DriverBookingMap;
