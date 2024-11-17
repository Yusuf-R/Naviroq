'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { setLoctionValidator } from "@/validators/locationValidator";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { toast } from "sonner";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AdminUtils from "@/utils/AdminUtils";
import { CircularProgress } from "@mui/material";

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Google Maps Autocomplete setup
const loadGoogleMapsScript = (callback) => {
    if (typeof window !== "undefined" && !window.google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    } else if (window.google) {
        callback();
    }
};

const locationCategory = ["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"];

function EditLocation({ driverProfile, locationData }) {
    const [activeTab, setActiveTab] = useState('/driver/location/edit');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
        mode: "onTouched",
        resolver: zodResolver(setLoctionValidator),
        reValidateMode: "onChange",
    });
    const [autocomplete, setAutocomplete] = useState(null);

    // Locate the specific address object using locationData (the ID of the address)
    const addressData = driverProfile.addresses.find((address) => address._id === locationData);


    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');


    useEffect(() => {
        if (addressData) {
            reset({
                category: addressData.category || '',
                latitude: addressData.latitude,
                longitude: addressData.longitude,
                description: addressData.description || ''
            });
        }
    }, [addressData, reset]);

    useEffect(() => {
        loadGoogleMapsScript(() => {
            const input = document.getElementById("address-input");
            const autocompleteInstance = new window.google.maps.places.Autocomplete(input);
            autocompleteInstance.addListener("place_changed", () => {
                const place = autocompleteInstance.getPlace();
                if (place.geometry) {
                    console.log({ place });
                    const location = place.geometry.location;
                    const coords = { latitude: location.lat(), longitude: location.lng() }
                    setValue('locationCoords', coords);
                    setValue("locationName", place.formatted_address);
                    setValue("latitude", location.lat(), { shouldValidate: true });
                    setValue("longitude", location.lng(), { shouldValidate: true });
                }
            });
            setAutocomplete(autocompleteInstance);
        });
    }, [setValue]);

    const handleCategoryChange = (value) => {
        setValue("category", value);
    };

    useEffect(() => {
        if (pathname.includes('edit')) {
            setActiveTab('/driver/location/edit');
        } else if (pathname.includes('view')) {
            setActiveTab('/driver/location/view');
        } else if (pathname.includes('set')) {
            setActiveTab('/driver/location/set');
        } else {
            setActiveTab('/driver/location');
        }
    }, [pathname]);

    const mutation = useMutation({
        mutationKey: ["EditClientLocation"],
        mutationFn: AdminUtils.editClientLocation
    });

    const updateData = (formObj) => {
        setIsLoading(true);
        const { success, data } = setLoctionValidator.safeParse(formObj);
        if (!success) {
            toast.error("Please fill in all required fields.");
            return;
        }
        data._id = locationData;
        console.log({ data });
        mutation.mutate(data, {
            onSuccess: async () => {
                queryClient.invalidateQueries({ queryKey: ["DriverData"] });
                toast.success("Location updated successfully");
                setIsLoading(false);
                router.refresh();
                router.push('/driver/location/view');
            },
            onError: (error) => {
                toast.error("Failed to update location");
                setIsLoading(false);
                console.error("Error updating location:", error);
            }
        });
    };

    if (Object.keys(errors).length > 0) {
        toast.error("Please fill all the required fields");
        setIsLoading(false);
        console.log({ errors });
    }

    return (
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
                        label="Edit-Location"
                        component={Link}
                        href="/driver/location/edit"
                        value="/driver/location/edit"
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
                        label="Set-Location"
                        component={Link}
                        href="/driver/location/set"
                        value="/driver/location/set"
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
                component="form"
                onSubmit={handleSubmit(updateData)}
                noValidate
                autoComplete="off"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    width: '100%',
                    backgroundColor: '#FFF',
                }}
            >
                <Grid container spacing={4}>
                    <Grid item size={12}>
                        <Card sx={{
                            background: 'linear-gradient(to right, #000046, #1cb5e0)',
                            padding: '16px',
                            borderRadius: '10px'
                        }}>
                            <Typography variant="body1" sx={{
                                color: '#FFF',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>
                                Edit Location Info
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Location Category"
                                    fullWidth
                                    error={!!errors.category}
                                    helperText={errors.category?.message || ""}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    value={field.value || addressData.category || ''}
                                >
                                    {locationCategory.map((cat) => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                        <TextField
                            id="address-input"
                            label="Search Location"
                            fullWidth
                            placeholder="Enter your location"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 3 }}>
                        <Controller
                            name="latitude"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Latitude"
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    error={!!errors.latitude}
                                    helperText={errors.latitude?.message || ""}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 3 }}>
                        <Controller
                            name="longitude"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Longitude"
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    error={!!errors.longitude}
                                    helperText={errors.longitude?.message || ""}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={1}
                                    error={!!errors.description}
                                    helperText={errors.description?.message || ""}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
<br />
                <Stack direction='row' gap={2} sx={{ justifyContent: 'flex-start' }}>
                    <Link href="/driver/location/view">
                        <Button variant="contained" color='error' aria-label="Baack"> Back </Button>
                    </Link>
                    <Button
                        variant="contained"
                        color="success"
                        type="submit"
                        aria-label="Add location"
                        endIcon={isLoading && <CircularProgress size={20} color="inherit" sx={{ color: 'white', ml: 1 }} />}
                        onClick={(e) => isLoading && e.preventDefault()} // Prevent default click if updating
                        sx={{
                            ...(isLoading && {
                                pointerEvents: 'none',  // Disable interaction
                                opacity: 1,             // Maintain original opacity
                            }),
                        }}
                    >
                        {isLoading ? 'Updating...' : 'Save'}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default EditLocation;
