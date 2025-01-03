'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import Chip from "@mui/material/Chip";
import { set } from 'mongoose';


const getBadgeStyles = (status) => {
    switch (status) {
        case 'Active':
            return {
                backgroundColor: 'success.main',
                color: 'white',
            };
        case 'Suspended':
            return {
                backgroundColor: colorSuspended,
                color: 'black',
            };
        case 'Terminated':
            return {
                backgroundColor: 'error.main',
                color: 'white',
            };
        case 'Deceased':
            return {
                backgroundColor: colorDeceased,
                color: 'white',
            };
        case 'Pending':
            return {
                backgroundColor: 'secondary.main',
                color: 'white',
            };
        default:
            return {
                backgroundColor: 'default',
                color: 'white',
            };
    }
};


function Profile({ driverProfile }) {
    const [activeTab, setActiveTab] = useState('/driver/profile');
    const pathname = usePathname();
    const router = useRouter();
    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');
    // state variables

    useEffect(() => {
        if (pathname.includes('update')) {
            setActiveTab('/driver/profile/update');
        } else if (pathname.includes('avatar')) {
            setActiveTab('/driver/profile/avatar');
        } else if (pathname.includes('location')) {
            setActiveTab('/driver/location');
        } else {
            setActiveTab('/driver/profile');
        }
    }, [pathname]);

    const editBiodata = async () => {
        router.push(`/driver/profile/update`);
    };

    const updateAvatar = async () => {
        router.push(`/driver/profile/avatar`);
    };

    const location = async () => {
        router.push(`/driver/profile/location`);
    }   



    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    backgroundColor: "#1F2937",
                    width: '100%',
                    p: 0.5,
                }}
            >
                {/* Navigation Tabs */}
                <Stack direction='row' spacing={2} sx={{
                    justifyContent: 'flex-start',
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        centered
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#46F0F9',
                            },
                        }}
                    >
                        <Tab
                            label="Profile"
                            component={Link}
                            href="/driver/profile"
                            value="/driver/profile"

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
                            label="Edit-Biodata"
                            onClick={editBiodata}
                            href="/driver/profile/update"
                            value="/driver/profile/update"
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
                            label="Avatar"
                            component={Link}
                            onClick={updateAvatar}
                            href="/driver/profile/avatar"
                            value="/driver/profile/avatar"
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
                            label="Location"
                            component={Link}
                            onClick={location}
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
                    </Tabs>
                </Stack>
                <br />
                {/*ParentBox*/}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isLargeScreen ? 'row' : 'column',
                        justifyContent: 'space-between',
                        alignItems: isLargeScreen ? 'flex-start' : 'flex-start',  // Align to top for both screens
                        flexWrap: 'nowrap',  // Ensure LHS and RHS remain side by side
                        height: isLargeScreen ? 'auto' : 'auto',
                        padding: isLargeScreen ? '0' : '10px',
                    }}
                >
                    {/* LHS */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            p: '1px',
                            width: isLargeScreen ? '25%' : '100%',
                            maxWidth: isLargeScreen ? '30%' : '100%',
                            height: isLargeScreen ? '100vh' : 'auto',  // LHS should fill the viewport height on large screens
                        }}
                    >
                        {/* Content for the left side */}
                        <Stack
                            direction='column'
                            spacing={3}
                            sx={{
                                width: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',

                                height: 'auto',
                            }}
                        >
                            {driverProfile.avatar !== "" ? (
                                <Avatar
                                    src={driverProfile.avatar ? driverProfile.avatar : '/av-1.svg'}
                                    alt={driverProfile.email}
                                    sx={{
                                        width: xSmall || small || medium ? 100 : large ? 150 : xLarge ? 200 : 250,
                                        height: xSmall || small || medium ? 100 : large ? 150 : xLarge ? 200 : 250,
                                        color: '#FFF',
                                    }}

                                />
                            ) : (
                                <Avatar
                                    src={driverProfile.gender === 'Male' ? '/Avatar-9.svg' : '/Avatar-10.svg'}
                                    alt={driverProfile.email}
                                    sx={{
                                        width: xSmall || small || medium ? 150 : large ? 200 : xLarge ? 250 : 300,
                                        height: xSmall || small || medium ? 150 : large ? 200 : xLarge ? 250 : 300,
                                        color: '#FFF',
                                    }}
                                />
                            )}
                            <Badge
                                sx={{
                                    '& .MuiBadge-badge': getBadgeStyles(driverProfile.status)
                                }}
                                overlap="circular"
                                badgeContent={driverProfile.status}
                            />
                            <Stack spacing={0.5}
                                alignItems="center"> {/* Add a smaller spacing between text elements */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#46F0F9',
                                        fontSize: xSmall || small || medium || large ? '1.0rem' : '1.1rem',
                                    }}
                                >
                                    {driverProfile.fullName}
                                </Typography>
                            </Stack>
                            <Button variant="contained" color='info' onClick={updateAvatar} sx={{
                                borderRadius: '10px',
                                mt: 1,
                            }}>
                                <Typography variant="body1"
                                    sx={{
                                        color: 'FFF',
                                        fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.0rem',
                                        fontWeight: 'bold'
                                    }}>
                                    Update Avatar
                                </Typography>
                            </Button>
                        </Stack>
                    </Box>
                    <br />
                    {/*RHS*/}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                            width: isLargeScreen ? '60%' : '100%',
                            maxWidth: isLargeScreen ? '80%' : '100%',
                            height: 'auto',  // RHS should fill the viewport height on large screens
                        }}
                    >
                        <Grid container spacing={4}>
                            {/* Section 1: Personal Information */}
                            <Grid size={12}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                        Personal Info
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.fullName}
                                    </Typography>
                                </Card>
                            </Grid>

                            {/* Email */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{
                                            color: '#46F0F9',
                                            fontSize: '14px',
                                            mb: 1
                                        }}>
                                        Email
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.email}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Phone Number */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Phone Number
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold',
                                        }}>
                                        {driverProfile.phoneNumber}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* dob */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Date of Birth
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.dob}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* gender */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Gender
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.gender}
                                    </Typography>
                                </Card>
                            </Grid>
                            <br />
                            <Grid size={12}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                        Next of Kin Info
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Next of Kin
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.nextOfKin}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Relationship */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{
                                            color: '#46F0F9',
                                            fontSize: '14px',
                                            mb: 1
                                        }}>
                                        Relationship
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.nextOfKinRelationship}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Next of kin Phone */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Phone
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.nextOfKinPhone}
                                    </Typography>
                                </Card>
                            </Grid>
                            <br />
                            <Grid size={12}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #000046, #1cb5e0)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                        Vehicle Info
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Next of kin Phone */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Vehicle Type
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.vehicleType}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Next of kin Phone */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Vehicle Plate Number
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.vehiclePlateNumber}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Vehicle  Model
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.vehicleModel}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Vehicle Color
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.vehicleColor}
                                    </Typography>
                                </Card>
                            </Grid>
                            {/* Next of kin Phone */}
                            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                                <Card sx={{
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                    padding: '16px',
                                    borderRadius: '10px'
                                }}>
                                    <Typography variant="subtitle2"
                                        sx={{ color: '#46F0F9', fontSize: '14px', mb: 1 }}>
                                        Driver License Number
                                    </Typography>
                                    <Typography variant="body1"
                                        sx={{
                                            color: '#FFF',
                                            fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                        {driverProfile.driverLicenseNumber}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                    <br />
                    <br />
                </Box>
            </Box>
        </>
    )
}

export default Profile;