// src/lib/models/Navigator.js
import mongoose from "mongoose";
import dbClient from "@/server/database/mongoDB.js";

const { Schema, model } = mongoose;

// Ensure DB is connected before model initialization
const connectDB = async () => {
    if (mongoose.connection.readyState !== 1) {
        await dbClient.connect();
    }
};

// Base Navigator schema
const options = {
    discriminatorKey: 'role',
    timestamps: true,
};

const NavigatorSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId && !this.githubId && !this.facebookId;
        },
    },
    fullName: { type: String, required: [true, "Full Name is required"] },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Deactivated', 'Suspended', 'Pending', 'Banned', 'Deleted', 'Blocked'],
        default: 'Active',
    },
    avatar: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    nextOfKin: { type: String, default: null },
    nexOfKinRelatoinship: { type: String, default: null },
    nexOfKinPhone: { type: String, default: null },
    dob: {type: String, default: Date, default: null},
    gender: { type: String, enum: ['Male', 'Female'], default: null },
    avatarConfirmation: {type: String, enum: ['Pending', 'Requested', 'Accepted', 'Rejected'], default: 'Accepted'},
    ctrlFlag: {type: Boolean, default: false},
    resetPwd: Boolean,
    resetTTL: Date,
    resetOTP: String,
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    facebookId: { type: String, default: null },
}, options);

// Define the Address schema for categorized addresses
const AddressSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"],
        required: true,
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    locationName: { type: String, required: true },
    description: { type: String, default: "" },
}, { _id: true });

// Client-specific schema with addresses and ride history
const ClientSchema = new Schema({
    addresses: {
        type: [AddressSchema], // Store multiple addresses for quick access
        default: [],
    },
    rideHistory: [
        {
            pickup: AddressSchema,
            destination: AddressSchema,
            driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
            timestamp: { type: Date, default: Date.now },
        }
    ],
});

// Admin-specific schema with permissions
const AdminSchema = new Schema({
    permissions: {
        type: [String],
        default: ["manage-users", "manage-site"],
    },
});

// Driver-specific schema with vehicle details
const DriverSchema = new Schema({
    vehicleType: { type: String, required: false },
    licenseNumber: { type: String, required: false },
});

// Model Initialization
const getNavigatorModels = async () => {
    await connectDB();

    const Navigator = mongoose.models.Navigator || model("Navigator", NavigatorSchema);
    const Client = mongoose.models.Client || Navigator.discriminator('Client', ClientSchema);
    const Admin = mongoose.models.Admin || Navigator.discriminator('Admin', AdminSchema);
    const Driver = mongoose.models.Driver || Navigator.discriminator('Driver', DriverSchema);

    return { Navigator, Client, Admin, Driver };
};

export default getNavigatorModels;
