'use client';

import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // Ensure router is imported
import AdminUtils from "@/utils/AdminUtils";
import useClientStore from "@/store/useClientStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import useLocationStore from '@/store/useLocationStore';

const EditLocation = lazy(() => import("@/components/Client/ProfileComponents/Location/Edit/EditLocation"));

function EditSavedLocation() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedClientData, setEncryptedClientData } = useClientStore();
    const { locationData } = useLocationStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Step 1: Check for cached client profile or encrypted data to decrypt
    useEffect(() => {
        async function fetchAndProcessData() {
            if (clientProfile) {
                setDecryptedProfile(clientProfile); // Directly use TanStack cached data
            } else if (encryptedClientData) {
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedClientData);
                    queryClient.setQueryData(["ClientData"], decryptedData); // Cache decrypted data in TanStack
                    setDecryptedProfile(decryptedData);
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/404'); // Navigate to error page
                }
            } else {
                try {
                    const response = await AdminUtils.clientProfile();
                    const { clientProfile: fetchedProfile } = response;
                    const newEncryptedData = await AdminUtils.encryptData(fetchedProfile);

                    queryClient.setQueryData(["ClientData"], fetchedProfile);
                    setEncryptedClientData(newEncryptedData);

                    setDecryptedProfile(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e404');
                }
            }
        }

        const clientProfile = queryClient.getQueryData(["ClientData"]);
        fetchAndProcessData();
    }, [queryClient, encryptedClientData, setEncryptedClientData, router]);

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
            <EditLocation clientProfile={decryptedProfile} locationData={locationData} />
        </Suspense>
    );
}

export default EditSavedLocation;
