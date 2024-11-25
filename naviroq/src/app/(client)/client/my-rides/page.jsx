'use client';

import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/server/database/firebaseConfig";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import AdminUtils from "@/utils/AdminUtils";
import useClientStore from "@/store/useClientStore";

const MyRides = lazy(() => import("@/components/Client/MyRides/MyRides"));

async function fetchClientRides(clientId) {
    if (!clientId) throw new Error("Client ID is missing");

    try {
        const ridesCollectionRef = collection(db, "clientRides", clientId, "rides"); // Use "clientRides"
        const querySnapshot = await getDocs(ridesCollectionRef);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching client rides:", error);
        throw error;
    }
}

function RideHistory() {
    const [clientProfile, setClientProfile] = useState(null);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { encryptedClientData, setEncryptedClientData } = useClientStore();

    useEffect(() => {
        async function fetchAndDecryptProfile() {
            try {
                // Check for cached driver profile in TanStack or Zustand
                const cachedProfile = queryClient.getQueryData(["ClientData"]);

                if (cachedProfile) {
                    setClientProfile(cachedProfile);
                    return cachedProfile;
                }

                if (encryptedClientData) {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedClientData);
                    queryClient.setQueryData(["ClientData"], decryptedData);
                    setClientProfile(decryptedData);
                    return decryptedData;
                }

                // If no data is cached, fetch from backend
                const response = await AdminUtils.clientProfile();
                const { clientProfile: fetchedProfile } = response;
                const encryptedData = await AdminUtils.encryptData(fetchedProfile);

                queryClient.setQueryData(["ClientData"], fetchedProfile);
                setEncryptedClientData(encryptedData);
                setClientProfile(fetchedProfile);

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
                if (!profile) throw new Error("Client profile not found");
                console.log({ profile });
                const ridesData = await fetchClientRides(profile._id);
                setRides(ridesData);
            } catch (error) {
                console.error("Error fetching rides:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRides();
    }, [queryClient, encryptedClientData, setEncryptedClientData, router]);

    if (loading) {
        return <LazyLoading />;
    }

    console.log({rides})

    return (
        <Suspense fallback={<LazyLoading />}>
            <MyRides clientProfile={clientProfile} rides={rides} />
        </Suspense>
    );
}

export default RideHistory;
