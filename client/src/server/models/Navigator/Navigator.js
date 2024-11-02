// src/lib/models/Navigator.js
import mongoose from "mongoose";
import dbClient from "@/server/database/mongoDB.js"; // Import your DB connection logic

const { Schema, model } = mongoose;

// Ensure DB is connected before model initialization
const connectDB = async() => {
    if (mongoose.connection.readyState !== 1) {
        await dbClient.connect(); // Ensure database connection
    }
};

// Base Navigator schema
const options = {
    discriminatorKey: 'role', // Differentiate between Client, Admin, Driver
    timestamps: true,
};

const NavigatorSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Email is invalid",
        ],
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && !this.githubId && !this.facebookId;
        }, // Password is required only if social logins are not used
    },
    fullName: {
        type: String,
        required: [true, "Full Name is required"],
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Deactivated', 'Suspended', 'Pending', 'Banned', 'Deleted', 'Blocked'],
        default: 'Active',
    },
    avatar: {
        type: String,
        default: null,
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    googleId: {
        type: String, // Google unique identifier
        default: null,
    },
    githubId: {
        type: String, // GitHub unique identifier
        default: null,
    },
    facebookId: {
        type: String, // Facebook unique identifier
        default: null,
    },
}, options);

// Function to initialize the Navigator model and its children
const getNavigatorModels = async() => {
    await connectDB(); // Ensure DB connection

    // Define the base Navigator model if it hasn't been created
    const Navigator = mongoose.models.Navigator || model("Navigator", NavigatorSchema);

    // Client-specific schema
    const ClientSchema = new Schema({
        rideHistory: {
            type: [String], // Store ride history as an array of strings
            default: [],
        },
    });

    // Admin-specific schema
    const AdminSchema = new Schema({
        permissions: {
            type: [String], // Admin permissions like managing users, site, etc.
            default: ["manage-users", "manage-site"],
        },
    });

    // Driver-specific schema
    const DriverSchema = new Schema({
        vehicleType: {
            type: String, // Type of vehicle the driver uses
            required: false,
        },
        licenseNumber: {
            type: String, // Driver’s license number
            required: false,
        },
    });

    // Create discriminators for Client, Admin, and Driver
    const Client = mongoose.models.Client || Navigator.discriminator('Client', ClientSchema);
    const Admin = mongoose.models.Admin || Navigator.discriminator('Admin', AdminSchema);
    const Driver = mongoose.models.Driver || Navigator.discriminator('Driver', DriverSchema);

    return { Navigator, Client, Admin, Driver };
};

export default getNavigatorModels;