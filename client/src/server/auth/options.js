// src/lib/auth/options.js
import AuthController from "@/server/controllers/AuthController";
import dbClient from "@/server/database/mongoDB"; // MongoDB client connection
import getNavigatorModels from "@/server/models/Navigator/Navigator"; // User model

import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

// Initialize NextAuth with providers
const options = {
    secret: process.env.AUTH_SECRET,
    providers: [
        Google,
        Github,
        Apple,
        Facebook,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async(credentials) => {
                try {
                    // Ensure connection to MongoDB
                    await dbClient.connect();

                    // Load the models (all roles use the same Navigator base schema)
                    const { Navigator } = await getNavigatorModels();

                    // Find the user by email (Navigator is the base model for all roles)
                    const user = await Navigator.findOne({ email: credentials.email }).select("+password");
                    if (!user) {
                        throw new Error("User not found");
                    }

                    // Check if the password is correct
                    const isPasswordValid = await AuthController.comparePassword(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }

                    // Return user object with role (used in JWT and session)
                    return { id: user._id, role: user.role };

                } catch (error) {
                    console.error("Authorization error:", error.message);
                    return null;
                }
            }
        }),
    ],
    session: {
        strategy: 'jwt', // Use JWT-based sessions instead of database sessions
        maxAge: 6 * 30 * 24 * 60 * 60, // 6 months session length
        updateAge: 24 * 60 * 60, // Update the session every 24 hours
        encryption: true, // Enable session encryption
    },
    jwt: {
        encryption: true, // Enable encryption for JWTs
        signingKey: process.env.NEXT_PUBLIC_JWT_SIGNING_PRIVATE_KEY, // Provide a private key for signing JWTs
        encryptionKey: process.env.NEXT_PUBLIC_JWT_ENCRYPTION_PRIVATE_KEY, // Provide a private key for encrypting JWTs
    },
    callbacks: {
        async jwt({ token, user }) {
            // When a user logs in for the first time, store the id and role
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token; // Only return id and role in the token
        },
        async session({ session, token }) {
            // Attach id and role to the session object
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        }
    }
};

export default options;