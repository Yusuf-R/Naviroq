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
    nextOfKinRelationship: { type: String, default: null },
    nextOfKinPhone: { type: String, default: null },
    dob: { type: String, default: Date, default: null },
    gender: { type: String, enum: ['Male', 'Female'], default: null },
    avatarConfirmation: { type: String, enum: ['Pending', 'Requested', 'Accepted', 'Rejected'], default: 'Accepted' },
    ctrlFlag: { type: Boolean, default: false },
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
    vehicleType: {
        type: String,
        enum: ["Bus", "Keke-Napep", "Car", "Others"],
        required: false
    },

    vehiclePlateNumber: { type: String, required: false },
    driverLicenseNumber: { type: String, required: false },
    vehicleModel: { type: String, required: false },
    vehicleColor: {
        type: String,
        enum: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Silver", "Grey", "Others"],
        required: false
    },
    customVehicleColor: {
        type: String,
        required: function () {
            return this.vehicleColor === "Others";
        },
        validate: {
            validator: function (value) {
                // Ensure custom color is provided if 'Others' is selected
                return this.vehicleColor === "Others" ? value && value.trim() !== "" : true;
            },
            message: "Custom vehicle color is required when 'Others' is selected.",
        },
    },
    vehicleYear: { type: String, required: false },
    vehicleCondition: { type: String, enum: ['New', 'Good', 'Fair', 'Needs Maintenance'], default: 'Good' },
    vehicleImage: [
        {
            type: String,
            required: false,
            validate: {
                validator: function (value) {
                    // You can add a URL pattern validation here if necessary
                    return value.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i);
                },
                message: "Each vehicle image must be a valid URL pointing to an image file.",
            },
        },
    ],

    // Insurance details
    insuranceNumber: { type: String, required: false },
    insuranceExpiryDate: { type: Date, required: false },

    availabilityStatus: {
        type: String,
        enum: ['Online', 'Busy', 'Offline'],
        default: 'Offline',
    },

    currentLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
    lastActive: { type: Date, default: Date.now },
    workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
    },

    // Profile verification and driver reviews
    profileVerificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    documents: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true },
            verified: { type: Boolean, default: false },
        },
    ],

    ratings: { type: Number, min: 0, max: 5, default: 0 },

    reviews: [
        {
            text: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            date: { type: Date, default: Date.now },
        }
    ],

    // Payment and ride completion details
    ridesCompleted: { type: Number, default: 0 },

    bankAccount: {
        accName: { type: String, required: false },
        bankName: { type: String, required: false },
        accountNumber: { type: String, required: false },
    },

    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Hold'], default: 'Pending' },

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
