"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import PlaceIcon from '@mui/icons-material/Place';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { toast } from "sonner";
import AdminUtils from "@/utils/AdminUtils";
import { signOut } from 'next-auth/react';
import { CircularProgress } from "@mui/material";


function SideNav({ navState, activeRoute }) {
  const router = useRouter();
  const [confirmExit, setConfirmExit] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const mutation = useMutation({
    mutationKey: ['Logout'],
    mutationFn: AdminUtils.driverLogout,
    onSuccess: () => {
      signOut({ callbackUrl: '/auth/driver' }); // Redirects after logout
      toast.success('Logged out successfully');
      setLoggingOut(false);
      setConfirmExit(false); // Close dialog
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
      setLoggingOut(false);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleNavigation = (route) => {
    router.push(route);
  };

  const navWidth = navState === "full" ? 210 : navState === "icon" ? 80 : 0;
  const showText = navState === "full";
  const showIcons = navState !== "hidden";

  const activeStyle = {
    backgroundColor: "#374151",
    borderRadius: "8px",
  };

  const hoverStyle = {
    "&:hover": {
      background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };

  return (
    <Box
      sx={{
        width: navWidth,
        transition: "width 0.3s",
        backgroundColor: "#1F2937",
        color: "white",
        display: navState === "hidden" ? "none" : "flex",
        flexDirection: "column",
        padding: showIcons ? "10px" : 0,
        borderRight: "1px solid grey",
        height: '100vh',
      }}
    >
      {showText && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Menu
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/driver/dashboard")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/dashboard" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <Badge
                color="success"
                variant={showText ? "dot" : "standard"}
                invisible={activeRoute !== "/driver/dashboard"}
              >
                <DashboardIcon />
              </Badge>
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Dashboard" />}
        </ListItem>
      </List>

      <Box sx={{ height: "20px" }} />

      {showText && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Transportation
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/driver/my-rides")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/my-rides" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <DirectionsCarIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="My Rides" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/driver/location")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/location" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <PlaceIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="My Locations" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/driver/promotions")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/promotions" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <LocalOfferIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Promotions" />}
        </ListItem>
      </List>

      <Box sx={{ height: "20px" }} />

      {showText && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Management
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/driver/profile")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/profile" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <PersonIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Profile" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/driver/settings")}
          sx={{ ...hoverStyle, ...(activeRoute === "/driver/settings" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <SettingsIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Settings" />}
        </ListItem>

        <ListItem
          button
          onClick={() => setConfirmExit(true)}  // Show confirmation dialog before logout
          sx={hoverStyle}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Logout" />}
        </ListItem>
      </List>

      {/* Confirmation Dialog for Logout */}
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
                pointerEvents: 'none', // Disable interaction while maintaining appearance
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

export default SideNav;
