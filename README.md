# Naviroq# **Naviroq**  
🚗 **Revolutionizing Ride-Hailing with Seamless Driver-Client Integration**

Naviroq is a feature-rich ride-hailing platform designed to connect drivers and clients in a transparent, efficient, and user-friendly manner. Built with cutting-edge technologies, Naviroq emphasizes real-time interaction, enhanced user experience, and scalability, aiming to redefine the ride-hailing landscape.

---

## **Features**

### 🚀 **Core Functionalities**  
1. **Dynamic Ride Tracking**  
   - Real-time tracking of drivers as they approach pickup points and throughout the trip to the destination.  
   - Intuitive dashboards for drivers to update ride statuses and provide timely notifications.  

2. **Smart Progress Mapping**  
   - A map-based interface that displays live locations of both drivers and clients, along with real-time updates on distance and ETA.  
   - Visual indicators (e.g., driver and client icons, route mapping).  

3. **Enhanced Interaction**  
   - Negotiation system for pricing and terms, ensuring transparency for both drivers and clients.  
   - Bidirectional communication tools to keep users synced during the trip.  

4. **Seamless Ride Management**  
   - "My Rides" interface for viewing ride history, ongoing trips, and detailed breakdowns of completed rides.  

### 🌟 **User-Centric Approach**  
- Transparent pricing and live updates to ensure trust between drivers and clients.  
- Role-based dashboards for clients, drivers, and admins to streamline user experiences.  

### 🔒 **Security**  
- **Authentication**:  
   - Powered by `Auth.js`, featuring credential-based login and OAuth integration (Google, GitHub).  
   - Encrypted tokens (JWE) for secure authentication and session handling.  
- **Authorization**:  
   - Middleware for protecting routes and enforcing role-based access control.  

---

## **Tech Stack**

### 🖥️ **Frontend**
- **Framework**: Next.js (App Router)  
- **UI Library**: Material UI for intuitive, responsive design.  
- **State Management**: Zustand for seamless client-side state handling.  

### 📡 **Backend**
- **Middleware**: Next.js middleware for token validation and route protection.  
- **Authentication**: Auth.js with JWE token encryption.  
- **Database**: MongoDB for user and ride data storage, Firebase Firestore for real-time updates.

### 🌍 **APIs & Integrations**  
- **Map API**: Google Maps API for route rendering, distance calculation, and geolocation.  
- **Cloud Storage**: Cloudinary for managing profile images and ride-related media.  

### 📦 **Other Tools**  
- **Version Control**: Git & GitHub for collaboration and project management.  
- **Hosting**: Deployed on Vercel for seamless CI/CD.

---

## **Project Structure**

```plaintext
├── src/
│   ├── auth/                 # Authentication logic
│   ├── components/           # Reusable UI components
│   ├── pages/                # Next.js pages (Client, Driver, Admin)
│   ├── server/
│   │   ├── auth/             # Auth.js configuration
│   │   ├── controllers/      # Business logic (e.g., AuthController)
│   │   ├── models/           # Database models for MongoDB
│   │   ├── routes/           # API routes
│   │   └── middleware.js     # Middleware for route protection
│   └── styles/               # Global styles and theme configuration
├── .env.local                # Environment variables (secure keys)
├── README.md                 # Documentation
└── package.json              # Dependencies and scripts
