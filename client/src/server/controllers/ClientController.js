'use server';
import AuthController from "./AuthController";
import dbClient from "@/server/database/mongoDB";
import getNavigatorModels from "@/server/models/Navigator/Navigator";
import { loginValidator, signUpValidator } from "@/validators/validateAuth";
import mongoose from "mongoose";

const { Client } = await getNavigatorModels(); // Load the Client model

const { ObjectId } = mongoose.Types;
class ClientController {

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
            const existingUser = await Client.findOne({ email }).select("+password");
            if (existingUser) {
                throw new Error("User already exists");
            }

            // Hash the password before saving the user
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new user
            const newUser = await Client.create({
                email,
                password: hashedPassword,
                fullName,
            });

            return newUser; // Return the newly created user
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('User registration failed');
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
            const user = await Client.findOne({ email }).select("+password");
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
            throw new Error('User login failed');
        }
    }

    static async Profile(userId) {
        try {
            // Fetch the user profile from the database
            await dbClient.connect();
            const clientProfile = await Client.findById(new ObjectId(userId));

            if (!clientProfile) {
                throw new Error("User not found");
            }
            return clientProfile;

        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('User profile failed');
        }

    }
}

export default ClientController;