"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, keyframes } from "@mui/material/styles";
import SharedDrawer from "@/components/Custom/SharedDrawer/SharedDrawer";

// Animation for color-changing border around the NAVIROQ text
const textBorderAnimation = keyframes`
  0% { border-color: #F34F00; }
  25% { border-color: #46F0F9; }
  50% { border-color: #34C0D9; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #F34F00; }
`;

// Animation for border effect around the Explore button
const buttonBorderAnimation = keyframes`
  0% { border-color: #F34F00; }
  25% { border-color: #46F0F9; }
  50% { border-color: #34C0D9; }
  75% { border-color: #8D3BFF; }
  100% { border-color: #F34F00; }
`;

// Define keyframe animation for fluid text color change
const fluidTextAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Animation for grand entry of the NAVIROQ text
const textEntryAnimation = keyframes`
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

function Hero() {
    const theme = useTheme();

    // Breakpoints as defined before
    const xSmall = useMediaQuery(theme.breakpoints.down("xs"));
    const small = useMediaQuery(theme.breakpoints.down("sm"));
    const medium = useMediaQuery(theme.breakpoints.down("md"));
    const large = useMediaQuery(theme.breakpoints.down("lg"));
    const xLarge = useMediaQuery(theme.breakpoints.down("xl"));
    const xxLarge = useMediaQuery(theme.breakpoints.down("xxl"));
    const ultraWide = useMediaQuery(theme.breakpoints.down("xxxxl"));

    // explore button
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // Open and close drawer
    const toggleDrawer = (open) => () => {
        setIsDrawerOpen(open);
    };

    return (
        <Box
            sx={{
                height: "90vh", // Full viewport height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "white",
                overflow: "hidden", // Prevents overflow issues
                position: "relative", // For correct positioning of elements
            }}
        >
            {/* Hero Content */}
            <Stack spacing={4} sx={{ zIndex: 1, maxWidth: "800px" }}>
                {/* NAVIROQ text with combined animation and grand entry */}
                <Box
                    sx={{
                        padding: "20px",
                        borderRadius: "10px",
                        borderWidth: "5px",
                        display: "inline-block",
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: xSmall ? "36px" : small ? "48px" : medium ? "72px" : "96px",
                            fontWeight: "bold",
                            color: "#FFF",
                            backgroundImage: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000)',
                            backgroundSize: '300% 100%',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: `${fluidTextAnimation} 8s ease infinite`,
                        }}
                    >
                        NAVIROQ
                    </Typography>
                </Box>

                {/* Subheading */}
                <Typography
                    variant="h6"
                    sx={{
                        fontSize: xSmall ? "16px" : small ? "18px" : medium ? "22px" : "24px",
                        color: "#FFF",
                    }}
                >
                    Your journey, perfectly navigated.
                </Typography>

                {/* Animated Explore Button */}
                <Button
                    variant="outlined"
                    sx={{
                        fontSize: xSmall ? "14px" : small ? "16px" : "18px",
                        fontWeight: "bold",
                        background: 'linear-gradient(to right, #780206, #061161)',
                        color: '#FFF',
                        padding: xSmall ? "10px 20px" : small ? "12px 24px" : "14px 28px",
                        borderWidth: "3px",
                        borderStyle: "solid",
                        animation: `${buttonBorderAnimation} 4s linear infinite`,
                        "&:hover": {
                            backgroundColor: "#34C0D9",
                            borderColor: "#0E1E1E",
                        },

                    }}
                    onClick={toggleDrawer(true)}
                >
                    Explore
                </Button>
            </Stack>

            {/* Drawer for mobile navigation */}
            <SharedDrawer isOpen={isDrawerOpen} onClose={toggleDrawer(false)} />

        </Box>
    );
}

export default Hero;
