"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminUtils from "@/utils/AdminUtils";
import { signOut } from 'next-auth/react';
import { CircularProgress } from "@mui/material";


function StatusBadge({ status }) {
    // Set color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case 'Online':
                return '#4CAF50'; // Green for online
            case 'Busy':
                return '#2196F3'; // Blue for busy
            case 'Offline':
                return '#F44336'; // Red for offline
            default:
                return '#BDBDBD'; // Grey for unknown status
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Status dot */}
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status),
                }}
            />
            {/* Status text with safety check */}
            <Typography variant="body2" color="#FFF">
                {status ? status.replace('-', ' ') : 'Unknown'}
            </Typography>
        </Box>
    );
}

// Usage in your component



function TopNav({ onToggleSideNav, driverProfile }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmExit, setConfirmExit] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();


    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        setConfirmExit(true);
        setAnchorEl(null); // Close the dropdown menu when logout is clicked
    };

    const mutation = useMutation({
        mutationKey: ['Logout'],
        mutationFn: AdminUtils.driverLogout,
        onSuccess: () => {
            signOut({ callbackUrl: '/auth/driver' }); // Redirects after logout
            toast.success('Logged out successfully');
            setConfirmExit(false); // Close dialog
            setLoggingOut(false);
        },
        onError: (error) => {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
            setLoggingOut(false);
        },
    });

    const handleLogout = () => {
        try {
            setLoggingOut(true);
            mutation.mutate();
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Logout failed. Please try again.');
            setLoggingOut(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                background: "linear-gradient(to right, #485563, #29323c)",
                color: "text.primary",
            }}
        >
            {/* Left Section: Logo and Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                    src="/logo.png"
                    alt="Naviroq Logo"
                    sx={{ width: 40, height: 40 }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold", color: '#FFF' }}>
                    Naviroq
                </Typography>
                <IconButton
                    aria-label="Toggle sidebar"
                    onClick={onToggleSideNav}
                    sx={{ color: '#FFF' }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Right Section: Profile and Dropdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                    src={driverProfile.avatar || "/av-1.svg"}
                    alt="User Avatar"
                    sx={{ width: 50, height: 50 }}
                />
                <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: '#FFF' }}>
                        {driverProfile.fullName || "User Name"}
                    </Typography>
                    <StatusBadge status={driverProfile.availabilityStatus} />
                </Box>
                <IconButton aria-label="Open profile menu" onClick={handleMenuOpen}>
                    <ArrowDropDownIcon sx={{ color: '#FFF' }} />
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        elevation: 3,
                        sx: { mt: 1.5, overflow: "visible" },
                    }}
                >
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => setConfirmExit(true)}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>

            {/* Logout Confirmation Dialog */}
            <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to logout?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmExit(false)} variant="contained" color="success">
                        No
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                            if (loggingOut) e.preventDefault();
                            else handleLogout();
                        }}
                        endIcon={loggingOut && <CircularProgress size={20} color="inherit" />}
                        sx={{
                            ...(loggingOut && {
                                pointerEvents: 'none', 
                                opacity: 1,
                            }),
                        }}
                    >
                        {loggingOut ? 'Logging out...' : 'Yes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TopNav;
