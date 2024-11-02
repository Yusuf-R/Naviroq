'use server';
import AuthController from "./AuthController";
import dbClient from "@/server/database/mongoDB";
import getNavigatorModels from "@/server/models/Navigator/Navigator";
import { loginValidator, signUpValidator } from "@/validators/validateAuth";
import mongoose from "mongoose";
const { Driver } = await getNavigatorModels(); // Load the Driver model

const { ObjectId } = mongoose.Types;
class DriverController {

    static async RegisterNew(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection
            // decrypt the data
            const { encryptedData } = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the user input
            const { success, data } = signUpValidator.safeParse(decryptedData);
            if (!success) {
                throw new Error("Validation failed");
            }
            const { email, password, fullName } = data;

            // Check if user already exists
            const existingUser = await Driver.findOne({ email }).select("+password");
            if (existingUser) {
                throw new Error("User already exists");
            }

            // Hash the password before saving the user
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new user
            const newUser = await Driver.create({
                email,
                password: hashedPassword,
                fullName,
            });

            return newUser; // Return the newly created user
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('Driver registration failed');
        }
    }

    static async Login(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection
            // decrypt the data
            const { encryptedData } = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the user input
            const { success, data } = loginValidator.safeParse(decryptedData);
            if (!success) {
                throw new Error("Login-Validation failed");
            }
            const { email, password } = data;

            // Find the user by email
            const user = await Driver.findOne({ email }).select("+password");
            if (!user) {
                throw new Error("User not found");
            }

            // Check if the password is correct
            const isPasswordValid = await AuthController.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }

            return user; // Return

        } catch (error) {
            console.error("Error in Login:", error.message);
            throw new Error('Driver login failed');
        }
    }


    static async Profile(driverId) {
        try {
            // Fetch the user profile from the database
            await dbClient.connect();
            const driverProfile = await Driver.findById(new ObjectId(driverId));

            if (!driverProfile) {
                throw new Error("Driver not found");
            }
            return driverProfile;

        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('Driver profile failed');
        }

    }
}

export default DriverController;