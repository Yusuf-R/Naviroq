"use client";
import { useRouter } from "next/navigation";
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

function SideNav({ navState, activeRoute }) {
  const router = useRouter();

  const handleNavigation = (route) => {
    router.push(route);
  };

  // Determine width based on navState
  const navWidth = navState === "full" ? 240 : navState === "icon" ? 80 : 0;
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
          onClick={() => handleNavigation("/user/dashboard")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <Badge
                color="success"
                variant={showText ? "dot" : "standard"}
                invisible={activeRoute !== "/user/dashboard"}
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
          onClick={() => handleNavigation("/user/my-rides")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/my-rides" ? activeStyle : {}) }}
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
          onClick={() => handleNavigation("/user/location")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/location" ? activeStyle : {}) }}
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
          onClick={() => handleNavigation("/user/promotions")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/promotions" ? activeStyle : {}) }}
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
          onClick={() => handleNavigation("/user/profile")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/profile" ? activeStyle : {}) }}
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
          onClick={() => handleNavigation("/user/settings")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/settings" ? activeStyle : {}) }}
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
          onClick={() => handleNavigation("/user/logout")}
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
    </Box>
  );
}

export default SideNav;
