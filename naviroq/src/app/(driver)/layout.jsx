"use client";
import TopNav from "@/components/Driver/TopNav/TopNav";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useCallback } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import SideNav from "@/components/Driver/SideNav/SideNav";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";

function DriverLayout({ children }) {
    const router = useRouter();
    const theme = useTheme();
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const [navState, setNavState] = useState("full"); // "full", "icon", "hidden"

    // Toggle between the three nav states
    const handleToggleNavState = () => {
        setNavState((prevState) => {
            if (prevState === "full") return "icon";
            if (prevState === "icon") return "hidden";
            return "full";
        });
    };

    const sideNavWidth = navState === "full" ? 210 : navState === "icon" ? 80 : 0;

    const queryClient = useQueryClient();
    const { driverProfile } = queryClient.getQueryData(["DriverData"]) || {};

    const { data, isLoading, isError } = useQuery({
        queryKey: ["DriverData"],
        queryFn: AdminUtils.driverProfile,
        staleTime: Infinity,
        enabled: !driverProfile,
    });

    const effectiveDriverData = driverProfile || data;

    const encryptAndStoreData = useCallback(async () => {
        try {
            if (effectiveDriverData) {
                await AdminUtils.encryptAndStoreProfile(effectiveDriverData);
            }
        } catch (error) {
            console.log('Encryption Failed');
            console.error("Encryption Error:", error);
        }
    }, [effectiveDriverData]);


    // Encrypt and store only when effectiveClientData changes
    useEffect(() => {
        encryptAndStoreData();
    }, [encryptAndStoreData]);

    if (isLoading) {
        return <LazyLoading />;
    }
    if (isError || !data) {
        router.push("/auth/login");
    }

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
            }}
        >
            {/* Side Navigation */}
            <Box
                sx={{
                    width: sideNavWidth,
                    transition: "width 0.3s",
                    backgroundColor: "#1F2937",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <SideNav navState={navState} activeRoute={router.pathname} />
            </Box>

            {/* Main Wrapper */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    overflow: "auto",
                }}
            >
                {/* Top Navigation */}
                <Box sx={{ flexShrink: 0 }}>
                    <TopNav
                        onToggleSideNav={handleToggleNavState}
                        driverProfile={effectiveDriverData}
                    />
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        padding: "0px",
                        backgroundColor: "#F3F4F6",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>

    );
}

export default DriverLayout;
