'use client';
import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import useClientStore from "@/store/useClientStore";
import LazyLoading from "@/components/LazyLoading/LazyLoading";

const ViewLocation = lazy(() => import("@/components/Client/ProfileComponents/Location/View/ViewLocation"));

function ViewMyLocations() {
    const [decryptedProfile, setDecryptedProfile] = useState(null);
    const { encryptedClientData, setEncryptedClientData } = useClientStore();
    const queryClient = useQueryClient();

    // Step 1: Check for the cached original client profile in TanStack
    const clientProfile = queryClient.getQueryData(["ClientData"]);

    // Step 2: Check Zustand for encrypted data and decrypt if needed
    useEffect(() => {
        async function fetchAndProcessData() {
            if (clientProfile) {
                // Case 1: If original profile data is found in TanStack, use it directly
                setDecryptedProfile(clientProfile);
            } else if (encryptedClientData) {
                // Case 2: If not in TanStack, but encrypted data exists in Zustand, decrypt it
                try {
                    const decryptedData = await AdminUtils.dataDecryption(encryptedClientData);
                    queryClient.setQueryData(["ClientData"], decryptedData); // Cache decrypted data in TanStack
                    setDecryptedProfile(decryptedData); // Set as profile data
                } catch (error) {
                    console.error("Decryption error:", error);
                    router.push('/error/e401'); // Navigate to error page
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

                    setDecryptedProfile(fetchedProfile);
                } catch (error) {
                    console.error("Fetching error:", error);
                    router.push('/error/e401'); // Navigate to error page
                }
            }
        }

        fetchAndProcessData();
    }, [clientProfile, encryptedClientData, queryClient, setEncryptedClientData]);

    // Show loading state while data is processed
    if (!decryptedProfile) {
        return <LazyLoading />;
    }

    return (
            <Suspense fallback={<LazyLoading/>}>
                <ViewLocation clientProfile={decryptedProfile} />
            </Suspense>
    );
}

export default ViewMyLocations;
