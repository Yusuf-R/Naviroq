import AuthController from "./AuthController";
import dbClient from "@/server/database/mongoDB";
import getNavigatorModels from "@/server/models/Navigator/Navigator";
import { loginValidator, signUpValidator } from "@/validators/validateAuth";
import { setLoctionValidator } from "@/validators/locationValidator"
import {driverBioDataValidator} from "@/validators/serverBioDataValidator";
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

            // Validate the driver input
            const { success, data } = signUpValidator.safeParse(decryptedData);
            if (!success) {
                throw new Error("Validation failed");
            }
            const { email, password, fullName } = data;

            // Check if driver already exists
            const existingUser = await Driver.findOne({ email }).select("+password");
            if (existingUser) {
                throw new Error("User already exists");
            }

            // Hash the password before saving the driver
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new driver
            const newUser = await Driver.create({
                email,
                password: hashedPassword,
                fullName,
            });

            return newUser; // Return the newly created driver
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

            // Validate the driver input
            const { success, data } = loginValidator.safeParse(decryptedData);
            if (!success) {
                throw new Error("Login-Validation failed");
            }
            const { email, password } = data;

            // Find the driver by email
            const driver = await Driver.findOne({ email }).select("+password");
            if (!driver) {
                throw new Error("User not found");
            }

            // Check if the password is correct
            const isPasswordValid = await AuthController.comparePassword(password, driver.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            // set his status to online
            driver.availabilityStatus = 'Online';
            await driver.save();

            await dbClient.close(); // Close the DB connection
            return driver; // Return

        } catch (error) {
            console.error("Error in Login:", error.message);
            throw new Error('Driver login failed');
        }
    }

    static async Logout(driverId) {
        try {
            await dbClient.connect();
            // Fetch the driver profile from the database
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }
            // set his status to offline
            driverProfile.availabilityStatus = 'Offline';
            await driverProfile.save();
            // Close the database connection
            await dbClient.close();
            return driverProfile;
        } catch (error) {
            console.error("Error in Logout:", error.message);
            throw new Error('User logout failed');
        }
    }

    static async Profile(driverId) {
        try {
            // Fetch the driver profile from the database
            await dbClient.connect();
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));

            if (!driverProfile) {
                await dbClient.close();
                throw new Error("User not found");
            }
            await dbClient.close();
            return driverProfile;

        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('User profile failed');
        }

    }

    static async SetLocation(driverId, obj) {
        try {
            // Fetch the driver profile from the database
            await dbClient.connect();
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
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
            driverProfile.addresses.push(newAddress);
            await driverProfile.save();
            await dbClient.close();

            return driverProfile;

        } catch (error) {
            console.error("Error in SetLocation:", error.message);
            throw new Error('Set location failed');
        }
    }

    static async AddLocation(driverId, obj) {
        try {
            // Fetch the driver profile from the database
            await dbClient.connect();
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }
            // validate the location data
            const { success, data } = setLoctionValidator.safeParse(obj);
            if (!success) {
                throw new Error("Location validation failed");
            }
            console.log({ data });
            const newAddress = {
                category: data.category,
                latitude: data.locationCoords.latitude,
                longitude: data.locationCoords.longitude,
                locationName: data.locationName,
                description: data.description || "",
            };
            console.log({ newAddress });
            console.log({ driverProfile });
            driverProfile.addresses.push(newAddress);
            await driverProfile.save();
            await dbClient.close();

            return driverProfile;

        } catch (error) {
            console.error("Error in SetLocation:", error.message);
            throw new Error('Set location failed');
        }
    }

    static async DeleteLocation(driverId, addressId) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert driverId and addressId to ObjectId if they are strings
            // Fetch the driver profile using the driverId
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }

            // Find the index of the address with the matching _id
            const addressIndex = driverProfile.addresses.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(addressId))  // Use `equals` to compare ObjectIds
            );

            if (addressIndex === -1) {
                throw new Error("Address not found");
            }

            // Remove the address from the addresses array
            driverProfile.addresses.splice(addressIndex, 1);

            // Save the updated profile
            await driverProfile.save();

            // Close the database connection
            await dbClient.close();

            return driverProfile;
        } catch (error) {
            console.error("Error in DeleteLocation:", error.message);
            throw new Error("Delete location failed");
        }
    }

    static async EditLocation(driverId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert driverId and addressId to ObjectId if they are strings
            // Fetch the driver profile using the driverId
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }

            // Find the index of the address with the matching _id
            const addressIndex = driverProfile.addresses.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(obj._id))  // Use `equals` to compare ObjectIds
            );

            if (addressIndex === -1) {
                throw new Error("Address not found");
            }

            // Update the address fields
            driverProfile.addresses[addressIndex].category = obj.category;
            driverProfile.addresses[addressIndex].latitude = obj.locationCoords.latitude;
            driverProfile.addresses[addressIndex].longitude = obj.locationCoords.longitude;
            driverProfile.addresses[addressIndex].locationName = obj.locationName || "";
            driverProfile.addresses[addressIndex].description = obj.description || "";

            // Save the updated profile
            await driverProfile.save();

            // Close the database connection
            await dbClient.close();

            return driverProfile;
        } catch (error) {
            console.error("Error in updateLocation:", error.message);
            throw new Error("Update location failed");
        }
    }

    static async UpdateAvatar(driverId, url) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Fetch the driver profile using the driverId
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }
            console.log("driverProfile", driverProfile);
            console.log("url", url);

            // Update the avatar URL
            driverProfile.avatar = url;

            // Save the updated profile
            await driverProfile.save();

            // Close the database connection
            await dbClient.close();

            return driverProfile;
        } catch (error) {
            console.error("Error in UpdateAvatar:", error.message);
            throw new Error("Update avatar failed");
        }

    }

    static async UpdateBioData(driverId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Fetch the driver profile using the driverId
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));
            if (!driverProfile) {
                throw new Error("User not found");
            }

            // cross check with schema validator
            const { success, data } = driverBioDataValidator.safeParse(obj);
            if (!success) {
                throw new Error("Bio data validation failed");
            }

             // Use Object.assign() to merge new fields without removing missing fields in the object
            Object.assign(driverProfile, data);
            

             // Check for and add any missing fields from the schema
             Driver.schema.eachPath((path) => {
                if (!driverProfile[path] && Driver.schema.paths[path].defaultValue !== undefined) {
                    // Set to default value if not present and has a default
                    driverProfile[path] = Driver.schema.paths[path].defaultValue;
                }
            });

            // Save the updated profile
            await driverProfile.save();

            // Close the database connection
            await dbClient.close();

            return driverProfile;
        } catch (error) {
            console.error("Error in UpdateBioData:", error.message);
            throw new Error("Update bio data failed");
        }
    }


    static async Profile(driverId) {
        try {
            // Fetch the driver profile from the database
            await dbClient.connect();
            const driverProfile = await Driver.findById(mongoose.Types.ObjectId.createFromHexString(driverId));

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