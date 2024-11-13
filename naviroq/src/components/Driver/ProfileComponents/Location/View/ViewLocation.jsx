'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import { toast } from "sonner";
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
import IconButton from "@mui/material/IconButton";
import AddLocation from '@mui/icons-material/AddLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import LazyComponent from '@/components/LazyComponent/LazyComponent';
import useLocationStore from '@/store/useLocationStore';

// Function to randomize colors for the map icon
const randomColor = () => {
    const colors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
    return colors[Math.floor(Math.random() * colors.length)];
};

function ViewLocation({ driverProfile }) {
    const [activeTab, setActiveTab] = useState('/user/location/view');
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');

    useEffect(() => {
        if (pathname.includes('update')) {
            setActiveTab('/user/profile/update');
        } else if (pathname.includes('avatar')) {
            setActiveTab('/user/profile/avatar');
        } else if (pathname.includes('location')) {
            setActiveTab('/user/location');
        } else {
            setActiveTab('/user/profile');
        }
    }, [pathname]);

    const mutationDelete = useMutation({
        mutationKey: ["deleteLocation"],
        mutationFn: AdminUtils.deleteClientLocation
    });



    const editBiodata = async () => {
        router.push(`/user/profile/update`);
    };

    const updateAvatar = async () => {
        router.push(`/user/profile/avatar`);
    };

    const onEdit = (objId) => {
        useLocationStore.getState().setLocationData(objId);
        router.push('/user/location/edit');
    };

    // Handler for opening confirmation dialog
    const handleDeleteClick = (addressId) => {
        setSelectedAddressId(addressId);
        setOpenConfirmDialog(true);
    };

    const confirmDelete = () => {
        setOpenConfirmDialog(false);
        setIsDeleting(true);
        if (!selectedAddressId) {
            setIsDeleting(false);
            toast.error('No location selected');
            setOpenConfirmDialog(false);
            return;
        }
        mutationDelete.mutate(selectedAddressId, {
            onSuccess: () => {
                toast.success("Location deleted successfully!");
                queryClient.invalidateQueries({ queryKey: ["DriverData"] });
                router.refresh();
                setIsDeleting(false);
            },
            onError: (error) => {
                toast.error("Error deleting location. Please try again.");
                setIsDeleting(false);
                console.error("Error saving location:", error);
            },
        });
    };
    // Handler for canceling deletion
    const cancelDelete = () => {
        setOpenConfirmDialog(false);
        setSelectedAddressId(null);
    };

    const handleAdd = async () => {
        setLoading(true);
        router.push('/user/location/add');
        setLoading(false);
    };


    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    backgroundColor: "#1F2937",
                    minHeight: '100vh',
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
                            href="/user/profile"
                            value="/user/profile"

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
                            href="/user/profile/update"
                            value="/user/profile/update"
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
                            href="/user/profile/avatar"
                            value="/user/profile/avatar"
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
                            href="/user/location"
                            value="/user/location"
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
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        padding: '10px',
                        widht: '100%',
                        flexGrow: 0,
                    }}
                >
                    <Grid container spacing={4}>
                        {/* Section 1: Personal Information */}
                        <Grid item size={12}>
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
                                    Saved Location Info
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={4}>
                        {driverProfile.addresses.map((address, index) => (
                            <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
                                <Card variant="outlined" sx={{
                                    padding: 2,
                                    position: 'relative',
                                    background: 'linear-gradient(to right, #1d4350, #a43931)',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                        <LocationOnIcon color={randomColor()} sx={{ fontSize: 40, marginRight: 1 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {address.category || 'Uncategorized'}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                Lat: {address.latitude.toFixed(5)} | Long: {address.longitude.toFixed(5)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{
                                                color: '#FFF',
                                                fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {address.description || 'Description: Not Available'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <br />
                                    <Typography variant="body2" color="textSecondary" sx={{
                                        color: '#FFF',
                                        fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {address.locationName || 'Location Name: Not Available'}
                                    </Typography>
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => onEdit(address._id)} sx={{ color: '#FFF' }}>
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteClick(address._id)} sx={{ color: 'yellow' }}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>

                                    </Box>
                                </Card>

                            </Grid>
                        ))}
                        <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                            <Card variant="outlined" sx={{
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                background: 'linear-gradient(to right, #1d4350, #a43931)',
                            }}>
                                <IconButton
                                    onClick={handleAdd}
                                    color="primary"
                                    disabled={loading} // Disable while loading
                                    sx={{ flexDirection: 'column', position: 'relative' }}
                                >
                                    {loading ? (
                                        <CircularProgress sx={{ fontSize: 50, color: 'green' }} />
                                    ) : (
                                        <AddLocation sx={{ fontSize: 50, color: 'green' }} />
                                    )}
                                    <Typography variant="subtitle1" sx={{
                                        color: '#FFF',
                                        fontSize: xSmall ? '0.8rem' : small ? '1.0rem' : '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {loading ? 'Processing...' : 'Add New Location'}
                                    </Typography>
                                </IconButton>
                            </Card>
                        </Grid>
                    </Grid>
                    {/* Confirmation Dialog */}
                    <Dialog open={openConfirmDialog} onClose={cancelDelete}>
                        <DialogTitle>Are you sure you want to delete this location?</DialogTitle>
                        <DialogActions>
                            <Button onClick={cancelDelete} color="error" variant='contained'>No</Button>
                            <Button onClick={confirmDelete} color="success" variant='contained' autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Lazy Component */}
                    {isDeleting && <LazyComponent Command="Deleting location" />}
                </Box>
            </Box>
        </>
    )
}

export default ViewLocation;