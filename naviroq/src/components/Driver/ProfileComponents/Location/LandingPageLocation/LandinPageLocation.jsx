'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Avatar from '@mui/material/Avatar';

function LandingPageLocation() {
    const [activeTab, setActiveTab] = useState('/driver/location');
    const router = useRouter();
    const pathname = usePathname();

    // Break Points
    const isXSmall = useMediaQuery('(max-width:599.99px)');
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');

    const isSmallScreen = xSmall || small || medium;
    const isMediumScreen = large || xLarge;

    useEffect(() => {
        // Update activeTab based on pathname
        if (pathname.includes('add')) {
            setActiveTab('/driver/location/add');
        } else if (pathname.includes('view')) {
            setActiveTab('/driver/location/view');
        } else {
            setActiveTab('/driver/location');
        }
    }, [pathname]);

    const headerItems = [
        { title: 'View-Saved Locations', src: '/view-location.svg', route: '/driver/location/view' },
        { title: 'Add-New Locations', src: '/saved-location.svg', route: '/driver/location/add' },
    ];

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: "#1F2937",
                    minHeight: '100vh',
                    p: 0.5,
                }}
            >
                {/* Navigation Tabs */}
                <Stack direction='row' spacing={2} sx={{ justifyContent: 'flex-start' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant={isXSmall ? "scrollable" : "standard"}
                        centered={!isXSmall}
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#46F0F9',
                            },
                        }}
                    >
                        <Tab
                            label="Location"
                            component={Link}
                            href="/driver/location"
                            value="/driver/location"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                        <Tab
                            label="View-Location"
                            component={Link}
                            href="/driver/location/view"
                            value="/driver/location/view"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                        <Tab
                            label="Add-Location"
                            component={Link}
                            href="/driver/location/add"
                            value="/driver/location/add"
                            sx={{
                                color: "#FFF",
                                fontWeight: 'bold',
                                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                                "&.Mui-selected": {
                                    color: "#46F0F9",
                                },
                            }}
                        />
                    </Tabs>
                </Stack>
                <br />
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isSmallScreen ? 'column' : 'row',
                        justifyContent: isSmallScreen ? 'center' : 'flex-start',
                        alignItems: isSmallScreen ? 'center' : 'flex-start',
                        padding: isSmallScreen ? '10px' : isMediumScreen ? '15px' : '20px',
                        backgroundColor: 'inherit',
                        gap: isSmallScreen ? '20px' : '40px',
                    }}
                >
                    {headerItems.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                width: isSmallScreen ? '100%' : 'auto',
                            }}
                            onClick={() => router.push(item.route)}
                        >
                            <Stack
                                direction="column"
                                spacing={{ xs: 1, sm: 2, md: 3 }}
                                alignItems="center"
                            >
                                <Avatar
                                    alt={item.title}
                                    src={item.src}
                                    sx={{
                                        width: isSmallScreen ? '150px' : '200px',
                                        height: isSmallScreen ? '150px' : '200px',
                                        marginBottom: isSmallScreen ? '10px' : '20px',
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#FFF',
                                        fontSize: isSmallScreen ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        "&:hover": {
                                            backgroundColor: 'green',
                                            color: '#FFF',
                                        },
                                    }}
                                >
                                    {item.title}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
}

export default LandingPageLocation;
