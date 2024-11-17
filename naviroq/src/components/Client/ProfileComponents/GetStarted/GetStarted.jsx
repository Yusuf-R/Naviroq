'use client';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import Button from "@mui/material/Button";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { motion } from 'framer-motion';

function GetStarted({clietnProfile}) {
    const router = useRouter();

    // Break Points
    const isLargeScreen = useMediaQuery('(min-width:900px)');

    const handleSetLocation = () => {
        router.push("/user/location/add");
    };

    return (
        <Box
            sx={{
                backgroundImage: `url(/bg-28.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'center',
                px: 1,
                
            }}
        >
            {/* Welcome Message Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Card sx={{
                    maxWidth: isLargeScreen ? 600 : '90%',
                    background: 'rgba(0, 0, 70, 0.85)',
                    padding: '32px 24px',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    border: '2px solid #1cb5e0',
                    animation: 'pulse 2s infinite',
                    mt:10,
                }}>
                    <Typography variant="h4" sx={{
                        color: '#FFF',
                        fontWeight: 'bold',
                        mb: 2,
                    }}>
                        Get Started!
                    </Typography>
                    <Typography variant="h5" sx={{
                        color: '#E0E0E0',
                        mb: 4,
                    }}>
                        To personalize your journey, let's set up your location. This helps us serve you better and provides a tailored experience.
                    </Typography>
                </Card>
            </motion.div>

            {/* Button with Hover and Border Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                whileHover={{
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 500 },
                }}
            >
                <Button
                    onClick={handleSetLocation}
                    endIcon={<LocationOnIcon sx={{ fontSize: '24px', color:'gold'}} />}
                    sx={{
                        mt: 4,
                        px: 4,
                        py: 1.5,
                        background: 'rgba(0, 0, 70, 0.85)',
                        color: '#FFF',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease-in-out',
                        border: '2px solid #1cb5e0',
                        '&:hover': {
                            backgroundColor: '#3399ff',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                        },
                    }}
                >
                    Set My Location
                </Button>
            </motion.div>

            {/* CSS Keyframes for subtle pulsing border animation */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 10px #1cb5e0, 0 0 20px #1cb5e0, 0 0 30px #1cb5e0;
                    }
                    50% {
                        box-shadow: 0 0 5px #1cb5e0, 0 0 15px #1cb5e0, 0 0 25px #1cb5e0;
                    }
                }
            `}</style>
        </Box>
    );
}

export default GetStarted;
