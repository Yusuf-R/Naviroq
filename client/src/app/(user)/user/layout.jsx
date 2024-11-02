"use client";
import TopNav from "@/components/Client/TopNav/TopNav";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import SideNav from "@/components/Client/SideNav/SideNav";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/server/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";

function ClientLayout({ children }) {
    const router = useRouter();
    const theme = useTheme();
    const medium = useMediaQuery(theme.breakpoints.down("md"));

    const [isSideNavOpen, setSideNavOpen] = useState(true);

    const handleToggleSideNav = () => setSideNavOpen(!isSideNavOpen);

    const queryClient = useQueryClient();
    const { clientProfile } = queryClient.getQueryData(["ClientData"]) || {};

    const { data, isLoading, isError } = useQuery({
        queryKey: ["ClientData"],
        queryFn: AdminUtils.clientProfile,
        staleTime: Infinity,
        enabled: !clientProfile,
    });

    if (isLoading) {
        return <LazyLoading />;
    }
    if (isError || !data) {
        router.push("/auth/login");
    }

    const effectiveClientData = clientProfile || data;

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden", // Prevent horizontal scrolling
                backgroundColor: "#FFF",
            }}
        >
            {/* Side Navigation */}
            <SideNav
                isOpen={isSideNavOpen}
                sx={{ width: isSideNavOpen ? 240 : 0, transition: "width 0.3s" }} // Ensure a fixed width
            />

            {/* Main Content Wrapper */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden", // Prevent scroll
                }}
            >
                {/* Top Navigation */}
                <TopNav
                    onToggleSideNav={handleToggleSideNav}
                    clientProfile={effectiveClientData}
                    sx={{ maxWidth: "100vw" }} // Prevent top navigation overflow
                />

                {/* Main Content */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: "hidden", // Ensure no extra scrolling
                        display: "flex",
                        backgroundColor: "#F3F4F6",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export default ClientLayout;
