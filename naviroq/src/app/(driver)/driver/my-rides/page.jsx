'use client';

import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import AdminUtils from "@/utils/AdminUtils";
import useDriverStore from "@/store/useDriverStore";

const MyRides = lazy(() => import("@/components/Driver/MyRides/MyRides"));

// Utility function to fetch driver rides from Firestore
async function fetchDriverRides(driverId) {
    if (!driverId) throw new Error("Driver ID is missing");

    try {
        const ridesCollectionRef = collection(db, "driverRides", driverId, "rides");
        const querySnapshot = await getDocs(ridesCollectionRef);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching driver rides:", error);
        throw error;
    }
}

function RideHistory() {
    const [driverProfile, setDriverProfile] = useState(null);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { encryptedDriverData, setEncryptedDriverData } = useDriverStore();

    useEffect(() => {
        async function fetchAndDecryptProfile() {
            try {
                // Check for cached driver profile in TanStack or Zustand
                const cachedProfile = queryClient.getQueryData(["DriverData"]);

                if (cachedProfile) {
                    setDriverProfile(cachedProfile);
                    return cachedProfile;
                }

                if (encryptedDriverData) {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedDriverData);
                    queryClient.setQueryData(["DriverData"], decryptedData);
                    setDriverProfile(decryptedData);
                    return decryptedData;
                }

                // If no data is cached, fetch from backend
                const response = await AdminUtils.driverProfile();
                const { driverProfile: fetchedProfile } = response;
                const encryptedData = await AdminUtils.encryptData(fetchedProfile);

                queryClient.setQueryData(["DriverData"], fetchedProfile);
                setEncryptedDriverData(encryptedData);
                setDriverProfile(fetchedProfile);

                return fetchedProfile;
            } catch (error) {
                console.error("Error fetching driver profile:", error);
                router.push("/error/e401");
            }
        }

        async function fetchRides() {
            try {
                setLoading(true);
                const profile = await fetchAndDecryptProfile();
                if (!profile) throw new Error("Driver profile not found");
                console.log({ profile });

                const ridesData = await fetchDriverRides(profile._id);
                setRides(ridesData);
            } catch (error) {
                console.error("Error fetching rides:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRides();
    }, [queryClient, encryptedDriverData, setEncryptedDriverData, router]);

    if (loading) {
        return <LazyLoading />;
    }

    console.log({rides})
    return (
        <Suspense fallback={<LazyLoading />}>
            <MyRides driverProfile={driverProfile} rides={rides} />
        </Suspense>
    );
}

export default RideHistory;
