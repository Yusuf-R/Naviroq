// src/server/auth/options.js
import AuthController from "@/server/controllers/AuthController";
import dbClient from "@/server/database/mongoDB"; // MongoDB client connection
import getNavigatorModels from "@/server/models/Navigator/Navigator"; // User model

import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

const options = {
    secret: process.env.AUTH_SECRET,
    providers: [
        Google,
        Github,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                try {
                    // Ensure connection to MongoDB
                    await dbClient.connect();

                    // Load the models (all roles use the same Navigator base schema)
                    const { Navigator } = await getNavigatorModels();

                    // Find the user by email
                    const user = await Navigator.findOne({ email: credentials.email }).select("+password");
                    if (!user) throw new Error("User not found");

                    // Check if the password is correct
                    const isPasswordValid = await AuthController.comparePassword(credentials.password, user.password);
                    if (!isPasswordValid) throw new Error("Invalid credentials");

                    // Return minimal user object for token (id and role)
                    return { id: user._id, role: user.role };
                } catch (error) {
                    console.error("Authorization error:", error.message);
                    return null;
                }
            }
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 3 * 30 * 24 * 60 * 60, // Set a shorter 3-month expiration for security
        updateAge: 24 * 60 * 60, // Update the session every 24 hours
        encryption: true,
    },
    jwt: {
        encryption: true, // Enable JWE encryption for JWT
        signingKey: process.env.JWT_SIGNING_PRIVATE_KEY, // Use non-public signing key
        encryptionKey: process.env.JWT_ENCRYPTION_PRIVATE_KEY, // Use non-public encryption key
    },
    callbacks: {
        async jwt({ token, user }) {
            // Include only id and role in the token for minimal exposure
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Attach minimal data to the session object for frontend access
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        }
    }
};

export default options;
