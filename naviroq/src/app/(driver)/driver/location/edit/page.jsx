'use client';

import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Ensure router is imported
import AdminUtils from "@/utils/AdminUtils";
import useDriverStore from "@/store/useDriverStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import useLocationStore from '@/store/useLocationStore';

const EditLocation = lazy(() => import("@/components/Driver/ProfileComponents/Location/Edit/EditLocation"));

function EditSavedLocation() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedDriverData, setEncryptedDriverData } = useDriverStore();
    const { locationData } = useLocationStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Step 1: Check for cached client profile or encrypted data to decrypt
    useEffect(() => {
        async function fetchAndProcessData() {
            if (driverProfile) {
                setDecryptedProfile(driverProfile); // Directly use TanStack cached data
            } else if (encryptedDriverData) {
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedDriverData);
                    queryClient.setQueryData(["DriverData"], decryptedData); // Cache decrypted data in TanStack
                    setDecryptedProfile(decryptedData);
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/404'); // Navigate to error page
                }
            } else {
                try {
                    const response = await AdminUtils.driverProfile();
                    const { driverProfile: fetchedProfile } = response;
                    const newEncryptedData = await AdminUtils.encryptData(fetchedProfile);

                    queryClient.setQueryData(["DriverData"], fetchedProfile);
                    setEncryptedDriverData(newEncryptedData);

                    setDecryptedProfile(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e404');
                }
            }
        }

        const driverProfile = queryClient.getQueryData(["DriverData"]);
        fetchAndProcessData();
    }, [queryClient, encryptedDriverData, setEncryptedDriverData, router]);

    // Redirect if locationData is missing
    useEffect(() => {
        if (!locationData) {
            router.push('/error/e404');
        }
    }, [locationData, router]);

    // Show loading state while data is processed
    if (!decryptedProfile || !locationData) {
        return <LazyLoading />;
    }

    return (
        <Suspense fallback={<LazyLoading />}>
            <EditLocation driverProfile={decryptedProfile} locationData={locationData} />
        </Suspense>
    );
}

export default EditSavedLocation;
