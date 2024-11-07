'use client';
import { lazy, useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import useClientStore from "@/store/useClientStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { toast } from 'sonner';

const RideBookingMap = lazy(() => import("@/components/Client/RideBookingMap/RideBookingMap"));

function UserDashboard() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedClientData, setEncryptedClientData } = useClientStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Step 1: Check for the cached original client profile in TanStack
    const clientProfile = queryClient.getQueryData(["ClientData"]);

    useEffect(() => {
        async function fetchAndProcessData() {
            if (clientProfile) {
                // Case 1: If original profile data is found in TanStack, use it directly
                handleLocationCheck(clientProfile);
            } else if (encryptedClientData) {
                // Case 2: If not in TanStack, but encrypted data exists in Zustand, decrypt it
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedClientData);
                    queryClient.setQueryData(["ClientData"], decryptedData); // Cache decrypted data in TanStack
                    handleLocationCheck(decryptedData);
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/404'); // Navigate to error page
                }
            } else {
                // Case 3: If neither TanStack nor Zustand has data, fetch from backend
                try {
                    const response = await AdminUtils.clientProfile();
                    const { clientProfile: fetchedProfile } = response;

                    // encrypt data and store in Zustand
                    const newEncryptedData = await AdminUtils.encryptData(fetchedProfile);

                    // Cache both original and encrypted data
                    queryClient.setQueryData(["ClientData"], fetchedProfile);
                    setEncryptedClientData(newEncryptedData);

                    handleLocationCheck(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e404'); // Navigate to error page
                }
            }
        }

        function handleLocationCheck(profile) {
            // Step 4: Check if the profile has saved locations
            const hasLocations = profile.addresses && profile.addresses.length > 0;
            if (!hasLocations) {
                // Redirect to Location Setup Page if no locations are found
                toast.info('Redirecting to location setup page...');
                toast.info('Please set up your locations to continue.');
                router.push("/user/get-started");
            } else {
                setDecryptedProfile(profile); // Set decrypted profile to load RideBookingMap
            }
        }

        fetchAndProcessData();
    }, [clientProfile, encryptedClientData, queryClient, setEncryptedClientData, router]);

    // Show loading state while data is processed or redirecting
    if (!decryptedProfile) {
        return <LazyLoading />;
    }

    return (
        <Suspense fallback={<LazyLoading />}>
            <RideBookingMap clientProfile={decryptedProfile} />
        </Suspense>
    );
}

export default UserDashboard;
