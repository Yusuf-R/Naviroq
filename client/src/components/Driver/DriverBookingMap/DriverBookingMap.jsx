'use client';
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig"; // Adjust this path
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { toast } from "sonner";
import 'leaflet/dist/leaflet.css';
const driverMode = 'Car';

function DriverBookingMap() {
  const [tripRequests, setTripRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Listen for trip requests that match the driver's transportation mode
  useEffect(() => {
    const q = query(
      collection(db, "tripRequests"),
      where("transportationMode", "==", driverMode),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTripRequests(requests);
    });

    return () => unsubscribe();
  }, [driverMode]);


  // Handle accepting or countering the offer
  const handleAcceptOffer = async (requestId) => {
    // Update the status to 'accepted'
    try {
      await updateDoc(doc(db, "tripRequests", requestId), {
        status: "accepted",
        driverId: "driver123", // Replace with actual driver ID
        driverDetails: { name: "John Doe", vehicle: driverMode },
      });
      toast.success("You accepted the trip!");
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to accept the trip. Try again.");
    }
  };

  // Display the trip requests in a modal
  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Available Trips for {driverMode}
      </Typography>

      <MapContainer center={[9.05785, 7.49508]} zoom={13} style={{ height: "80vh", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {selectedRequest && (
          <Marker position={[selectedRequest.pickupLocation.lat, selectedRequest.pickupLocation.lng]} />
        )}
      </MapContainer>

      {/* List of available trip requests */}
      <Box sx={{ mt: 2 }}>
        {tripRequests.map((request) => (
          <Box
            key={request.id}
            sx={{ p: 2, mb: 2, border: "1px solid #ddd", borderRadius: 2, cursor: "pointer" }}
            onClick={() => handleRequestClick(request)}
          >
            <Typography variant="h6">Trip from {request.pickupLocation.lat}, {request.pickupLocation.lng}</Typography>
            <Typography>Offer: ₦{request.offer}</Typography>
          </Box>
        ))}
      </Box>

      {/* Modal for accepting or countering trip requests */}
      {selectedRequest && (
        <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={{ p: 4, backgroundColor: "white", margin: "auto", width: 400, borderRadius: 2 }}>
            <Typography variant="h6">Trip Details</Typography>
            <Typography>From: {selectedRequest.pickupLocation.lat}, {selectedRequest.pickupLocation.lng}</Typography>
            <Typography>Offer: ₦{selectedRequest.offer}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => handleAcceptOffer(selectedRequest.id)}
            >
              Accept Offer
            </Button>
          </Box>
        </Modal>
      )}

    </>
  );
}

export default DriverBookingMap;