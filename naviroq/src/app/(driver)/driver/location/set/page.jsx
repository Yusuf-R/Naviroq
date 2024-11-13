'use client';

import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import useClientStore from "@/store/useClientStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
const SetLocation = lazy(() => import("@/components/Driver/ProfileComponents/Location/Set/SetLocation"));

function SetMyLocation() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedDriverData, setEncryptedDriverData } = useClientStore();
    const queryClient = useQueryClient();

    // Step 1: Check for the cached original client profile in TanStack
    const driverProfile = queryClient.getQueryData(["DriverData"]);
    // Step 2: Check Zustand for encrypted data and decrypt if needed
    useEffect(() => {
        async function fetchAndProcessData() {
            if (driverProfile) {
                // Case 1: If original profile data is found in TanStack, use it directly
                setDecryptedProfile(driverProfile);
            } else if (encryptedDriverData) {
                // Case 2: If not in TanStack, but encrypted data exists in Zustand, decrypt it
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedDriverData);
                    queryClient.setQueryData(["DriverData"], decryptedData); // Cache decrypted data in TanStack
                    setDecryptedProfile(decryptedData); // Set as profile data
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/404'); // Navigate to error page
                }
            } else {
                // Case 3: If neither TanStack nor Zustand has data, fetch from backend
                try {
                    const response = await AdminUtils.driverProfile();
                    const { driverProfile: fetchedProfile } = response;

                    // encrypt data and store in Zustand
                    const newEncryptedData = await AdminUtils.encryptData(fetchedProfile);

                    // Cache both original and encrypted data
                    queryClient.setQueryData(["DriverData"], fetchedProfile);
                    setEncryptedDriverData(newEncryptedData);

                    setDecryptedProfile(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e404'); // Navigate to error page
                }
            }
        }

        fetchAndProcessData();
    }, [driverProfile, encryptedDriverData, queryClient, setEncryptedDriverData]);

    // Show loading state while data is processed
    if (!decryptedProfile) {
        return <LazyLoading />;
    }
    return (
        <>
            <Suspense fallback={<LazyLoading />}>
                <SetLocation driverProfile={decryptedProfile}/>
            </Suspense>
        </>
    )
}

export default SetMyLocation;