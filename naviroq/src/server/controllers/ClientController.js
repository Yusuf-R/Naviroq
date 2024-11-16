import AuthController from "./AuthController";
import dbClient from "@/server/database/mongoDB";
import getNavigatorModels from "@/server/models/Navigator/Navigator";
import { loginValidator, signUpValidator } from "@/validators/validateAuth";
import { setLoctionValidator } from "@/validators/locationValidator";
import { clientBioDataValidator } from "@/validators/serverBioDataValidator";
import mongoose from "mongoose";

const { Client } = await getNavigatorModels(); // Load the Client model

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

    static async Logout(userId) {
        try {
            await dbClient.connect();
            // Fetch the user profile from the database
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }
            // Close the database connection
            await dbClient.close();
            return clientProfile;
        } catch (error) {
            console.error("Error in Logout:", error.message);
            throw new Error('User logout failed');
        }
    }

    static async Profile(userId) {
        try {
            // Fetch the user profile from the database
            await dbClient.connect();
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));

            if (!clientProfile) {
                await dbClient.close();
                throw new Error("User not found");
            }
            await dbClient.close();
            return clientProfile;

        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('User profile failed');
        }

    }

    static async SetLocation(userId, obj) {
        try {
            // Fetch the user profile from the database
            await dbClient.connect();
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }
            // validate the location data
            const { success, data } = setLoctionValidator.safeParse(obj);
            if (!success) {
                throw new Error("Location validation failed");
            }
            const newAddress = {
                category: data.category,
                latitude: data.locationCoords.latitude,
                longitude: data.locationCoords.longitude,
                locationName: data.locationName,
                description: data.description || "",
            };
            clientProfile.addresses.push(newAddress);
            await clientProfile.save();
            await dbClient.close();

            return clientProfile;

        } catch (error) {
            console.error("Error in SetLocation:", error.message);
            throw new Error('Set location failed');
        }
    }

    static async AddLocation(userId, obj) {
        try {
            // Fetch the user profile from the database
            await dbClient.connect();
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }
            // validate the location data
            const { success, data } = setLoctionValidator.safeParse(obj);
            if (!success) {
                throw new Error("Location validation failed");
            }
            const newAddress = {
                category: data.category,
                latitude: data.locationCoords.latitude,
                longitude: data.locationCoords.longitude,
                locationName: data.locationName,
                description: data.description || "",
            };
            clientProfile.addresses.push(newAddress);
            await clientProfile.save();
            await dbClient.close();

            return clientProfile;

        } catch (error) {
            console.error("Error in SetLocation:", error.message);
            throw new Error('Set location failed');
        }
    }

    static async DeleteLocation(userId, addressId) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the user profile using the userId
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }

            // Find the index of the address with the matching _id
            const addressIndex = clientProfile.addresses.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(addressId))  // Use `equals` to compare ObjectIds
            );

            if (addressIndex === -1) {
                throw new Error("Address not found");
            }

            // Remove the address from the addresses array
            clientProfile.addresses.splice(addressIndex, 1);

            // Save the updated profile
            await clientProfile.save();

            // Close the database connection
            await dbClient.close();

            return clientProfile;
        } catch (error) {
            console.error("Error in DeleteLocation:", error.message);
            throw new Error("Delete location failed");
        }
    }

    static async EditLocation(userId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the user profile using the userId
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }

            // Find the index of the address with the matching _id
            const addressIndex = clientProfile.addresses.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(obj._id))  // Use `equals` to compare ObjectIds
            );

            if (addressIndex === -1) {
                throw new Error("Address not found");
            }

            // Update the address fields
            clientProfile.addresses[addressIndex].category = obj.category;
            clientProfile.addresses[addressIndex].latitude = obj.locationCoords.latitude;
            clientProfile.addresses[addressIndex].longitude = obj.locationCoords.longitude;
            clientProfile.addresses[addressIndex].locationName = obj.locationName || "";
            clientProfile.addresses[addressIndex].description = obj.description || "";

            // Save the updated profile
            await clientProfile.save();

            // Close the database connection
            await dbClient.close();

            return clientProfile;
        } catch (error) {
            console.error("Error in updateLocation:", error.message);
            throw new Error("Update location failed");
        }
    }

    static async UpdateAvatar(userId, url) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Fetch the user profile using the userId
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }
            console.log("clientProfile", clientProfile);
            console.log("url", url);

            // Update the avatar URL
            clientProfile.avatar = url;

            // Save the updated profile
            await clientProfile.save();

            // Close the database connection
            await dbClient.close();

            return clientProfile;
        } catch (error) {
            console.error("Error in UpdateAvatar:", error.message);
            throw new Error("Update avatar failed");
        }

    }

    static async UpdateBioData(userId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Fetch the user profile using the userId
            const clientProfile = await Client.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!clientProfile) {
                throw new Error("User not found");
            }

            // cross check with schema validator
            const { success, data } = clientBioDataValidator.safeParse(obj);
            if (!success) {
                throw new Error("Bio data validation failed");
            }

           
            // Update profile with provided data
            Object.assign(clientProfile, data);

            // Check for and add any missing fields from the schema
            Client.schema.eachPath((path) => {
                if (!clientProfile[path] && Client.schema.paths[path].defaultValue !== undefined) {
                    // Set to default value if not present and has a default
                    clientProfile[path] = Client.schema.paths[path].defaultValue;
                }
            });

            // Save the updated profile
            await clientProfile.save();

            // Close the database connection
            await dbClient.close();

            return clientProfile;
        } catch (error) {
            console.error("Error in UpdateBioData:", error.message);
            throw new Error("Update bio data failed");
        }
    }
}

export default ClientController;