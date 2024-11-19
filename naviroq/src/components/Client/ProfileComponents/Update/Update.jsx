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
import { CircularProgress } from "@mui/material";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientBioDataValidator } from "@/validators/bioDataValidator";
import { FormControl } from "@mui/material/";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toast } from 'sonner';
import PhoneInput, {
    formatPhoneNumber,
    formatPhoneNumberIntl,
    isPossiblePhoneNumber,
    isValidPhoneNumber
} from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import FormHelperText from '@mui/material/FormHelperText';
import styled from "@mui/material/styles/styled";
import dayjs from "dayjs";
import {
    dobProps,
    nextOfKinRelationship,
    sex,
    txProps
} from "@/utils/data"
import AdminUtils from '@/utils/AdminUtils';



function UpdateProfile({ clientProfile }) {
    
    const [activeTab, setActiveTab] = useState('/user/profile/update');
    const pathname = usePathname();
    const router = useRouter();
    const [dobDate, setDobDate] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const isLargeScreen = useMediaQuery('(min-width:900px)');
    // state variables

    const isSmallScreen = useMediaQuery('(max-width:599.999px)');

    const { control, handleSubmit, setValue, formState: { errors }, reset, getValues } = useForm({
        mode: "onTouched",
        resolver: zodResolver(clientBioDataValidator),
        reValidateMode: "onChange",
        defaultValues: {
            email: '',
            fullName: '',
            phoneNumber: '',
            nextOfKin: '',
            nextOfKinRelatoinship: '',
            nextOfKinPhone: '',
            dob: '',
            gender: '',
        }
    });

    const phoneInputStyle = {
        '& .PhoneInput': {
            bgcolor: '#274e61',
            borderRadius: '10px',
            border: errors.phoneNumber ? '1px solid #ff4444' : errors.nextOfKinNumber ? '1px solid #ff4444' : '1px solid transparent',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                bgcolor: '#2c5468',
            },
            '&:focus-within': {
                bgcolor: '#2c5468',
                boxShadow: '0 0 0 2px rgba(70, 240, 249, 0.3)',
            },
        },
        '& .PhoneInputInput': {
            bgcolor: '#051935',
            border: 'none',
            color: 'white',
            p: '8px 12px',
            fontSize: '16px',
            outline: 'none',
            width: '100%',
            height: '45px',
            '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
            },
            '&:focus': {
                outline: 'none',
                border: 'none',
            },
        },
        '& .PhoneInputCountry': {
            mr: '10px',
            p: '5px',
            display: 'flex',
            alignItems: 'center',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '& .PhoneInputCountryFlag': {
            width: '28px',
            height: '22px',
            mr: '8px',
        },
        '& .PhoneInputCountrySelect': {
            color: 'white',
            bgcolor: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            '&:focus': {
                outline: 'none',
            },
            '& option': {
                bgcolor: '#274e61',
                color: 'white',
            },
        },
        '& .PhoneInputCountrySelectArrow': {
            color: 'gold',
            opacity: 0.7,
            borderWidth: '2px',
            ml: '8px',
        },
    }


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

    useEffect(() => {
        if (clientProfile) {
            reset({
                email: clientProfile.email || '',
                fullName: clientProfile.fullName || '',
                phoneNumber: clientProfile.phoneNumber || '',
                nextOfKin: clientProfile.nextOfKin || '',
                nextOfKinRelationship: clientProfile.nextOfKinRelationship || '',
                nextOfKinPhone: clientProfile.nextOfKinPhone || '',
                dob: clientProfile.dob || '',
                gender: clientProfile.gender || '',
            });
        }
    }, [clientProfile, reset]);

    useEffect(() => {
        const dobValue = getValues("dob");
        if (dobValue) {
            setDobDate(dayjs(dobValue, "DD/MMM/YYYY"));
        }
    }, []);

    const getNextOfKinOptions = () => {
        return nextOfKinRelationship.map((type) => (
            <MenuItem key={type} value={type}
                sx={{ color: 'white', '&:hover': { backgroundColor: '#051935' } }}>{type}</MenuItem>
        ));
    }
    const handleNextOfKinChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setValue('nextOfKinRelationship', event.target.value);
    }

    const getGenderType = () => {
        return sex.map((type) => (
            <MenuItem key={type} value={type}
                sx={{ color: 'white', '&:hover': { backgroundColor: '#051935' } }}>{type}</MenuItem>
        ));
    };
    const handleGenderTypeChange = (event) => {
        event.preventDefault();
        setValue('gender', event.target.value);
    }

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: AdminUtils.updateClientBiodata,
        mutationKey: ['UpdatClientBiodata'],
    })

    const updateData = async (objData) => {
        try {
            setUpdating(true);
            const { success, data } = clientBioDataValidator.safeParse(objData);
            if (!success) {
                setUpdating(false);
                toast.error('Please fill all the required fields');
                return;
            }
            mutation.mutate(data, {
                onSuccess: () => {
                    toast.success('Profile updated successfully');
                    queryClient.invalidateQueries(['ClientData']);
                    setUpdating(false);
                    router.refresh();
                    router.push('/user/profile');
                },
                onError: (error) => {
                    console.error('An unexpected error happened:', error);
                    toast.error('An error occurred while updating profile');
                    setUpdating(false);
                }
            })
        } catch (error) {
            setUpdating(false);
            toast.error('An error occurred while updating profile');
            console.error('An unexpected error happened:', error);
        }
    }


    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error("Please fill all the required fields");
            setUpdating(false);  // Ensure this is only called once per error change
        }
    }, [errors]);


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
                    overflow: isSmallScreen ? 'auto' : 'visible',

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
                        flexWrap: 'nowrap',
                        backgroundColor: "#1F2937",
                        minHeight: '100vh',
                        p: 0.5,
                        overflow: isSmallScreen ? 'auto' : 'visible',
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid size={12}>
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
                                    Update BioData
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
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
                                    FullName
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.fullName ? true : false}
                                                helperText={errors.fullName ? errors.fullName.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
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
                                <FormControl fullWidth>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                variant="outlined"
                                                error={errors.email ? true : false}
                                                helperText={errors.email ? errors.email.message : ''}
                                                value={field.value || ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                        readOnly: true
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                            <Card
                                sx={{
                                    background: 'linear-gradient(145deg, #1d4350, #a43931)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#46F0F9',
                                        fontSize: '15px',
                                        fontWeight: 'bold',
                                        mb: 1,
                                    }}
                                >
                                    Phone Number
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Box sx={phoneInputStyle}>
                                                <PhoneInput
                                                    {...field}
                                                    international
                                                    defaultCountry="NG"
                                                    countryCallingCodeEditable={false}
                                                    value={field.value || ''}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('phoneNumber', value);
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                    {errors.phoneNumber && (
                                        <FormHelperText
                                            sx={{
                                                color: '#ff4444',
                                                marginTop: 1,
                                                fontSize: '12px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            {errors.phoneNumber.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
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
                                    Gender
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleGenderTypeChange(e);
                                                }}
                                                required
                                                error={!!errors.gender}
                                                helperText={errors.gender ? errors.gender.message : ''}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{ color: "#4BF807" }}>
                                                    Select Gender
                                                </MenuItem>
                                                {getGenderType()}
                                            </TextField>

                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid xs={xSmall || small || medium ? 12 : large ? 6 : 6}>

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
                                    DOB
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        error={errors.dob?.message}
                                        render={({ field }) => (
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    {...field}
                                                    value={dobDate}
                                                    onChange={(newValue) => {
                                                        setDobDate(newValue);
                                                        field.onChange(dayjs(newValue).format("DD/MMM/YYYY"));
                                                    }}
                                                    disableFuture
                                                    views={['year', 'month', 'day']}
                                                    closeOnSelect={false}
                                                    inputRef={field.ref}
                                                    slotProps={dobProps}
                                                    format="LL"
                                                    sx={{
                                                        '& .MuiPaper-root': {
                                                            bgcolor: '#1F2937',
                                                        }
                                                    }}

                                                />
                                            </LocalizationProvider>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={12}>
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
                                    Next of Kin Info
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                            <FormControl fullWidth>
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
                                        Next of Kin
                                    </Typography>

                                    <Controller
                                        name="nextOfKin"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    color: "#46F0F9",
                                                }}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.nextOfKin}
                                                helperText={errors.nextOfKin ? errors.nextOfKin.message : ''}
                                                required
                                            />
                                        )}
                                    />

                                </Card>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
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
                                {/* Relationship*/}
                                <FormControl fullWidth>
                                    <Controller
                                        name="nextOfKinRelationship"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                select
                                                value={field.value || ''}
                                                error={!!errors.nextOfKinRelationship}
                                                helperText={errors.nextOfKinRelationship ? errors.nextOfKinRelationship.message : ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleNextOfKinChange(e);
                                                }}
                                                required
                                                slotProps={{
                                                    input: {
                                                        sx: txProps,
                                                    },
                                                    inputLabel: {
                                                        sx: {
                                                            color: "#FFF",
                                                            "&.Mui-focused": {
                                                                color: "white"
                                                            },
                                                        }
                                                    },
                                                    select: {
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: '#134357',
                                                                    color: 'white',
                                                                    maxHeight: 450,
                                                                    overflow: 'auto',
                                                                },
                                                            },
                                                        },

                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiSelect-icon': {
                                                        color: '#fff',
                                                    },
                                                    '& .MuiSelect-icon:hover': {
                                                        color: '#fff',
                                                    },
                                                }}>
                                                <MenuItem value="" sx={{ color: "#4BF807" }}>
                                                    Select Relationship
                                                </MenuItem>
                                                {getNextOfKinOptions()}
                                            </TextField>
                                        )}
                                    />
                                </FormControl>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
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
                                    Contact Number
                                </Typography>
                                <FormControl fullWidth>
                                    <Controller
                                        name="nextOfKinPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Box sx={phoneInputStyle}>
                                                <PhoneInput
                                                    {...field}
                                                    international
                                                    defaultCountry="NG"
                                                    countryCallingCodeEditable={false}
                                                    value={field.value || ''}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        setValue('nextOfKinPhone', value);
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    />
                                    {errors.nextOfKinPhone && (
                                        <FormHelperText
                                            sx={{
                                                color: 'red',
                                                mt: 1,
                                                ml: 2
                                            }}
                                        >
                                            {errors.nextOfKinPhone.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Card>
                        </Grid>
                    </Grid>
                    <br />
                    {/*Submitting button */}
                    <Stack direction='row' gap={3} sx={{ marginBottom: '75px', justifyContent: 'flex-start' }}>
                        <Link href="/user/profile">
                            <Button variant="contained" color='success' aria-label="Go back to user profile"> Back </Button>
                        </Link>
                        <Button variant="contained" color='info' onClick={() => reset()} aria-label="Clear form"> Clear </Button>
                        <Button
                            variant="contained"
                            color="error"
                            type="submit"
                            aria-label="Submit form"
                            endIcon={updating && <CircularProgress size={20} color="inherit" />}
                            onClick={(e) => updating && e.preventDefault()} // Prevent default click if updating
                            sx={{
                                ...(updating && {
                                    pointerEvents: 'none',  // Disable interaction
                                    opacity: 1,             // Maintain original opacity
                                }),
                            }}
                        >
                            {updating ? 'Updating...' : 'Submit'}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </>
    )
}

export default UpdateProfile