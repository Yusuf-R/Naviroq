'use client';
import { axiosPublic, axiosPrivate } from "@/server/utils/AxiosInstance"


// utilities for the FE

class AdminUtils {
    // to be used for Registration. Login and SetPassword Specific operations
    static async encryptCredentials(data) {
        const publicKeyPem = process.env.NEXT_PUBLIC_PEM_PUBLIC_KEY;
        // Convert PEM to ArrayBuffer
        // sourcery skip: avoid-function-declarations-in-blocks
        function pemToArrayBuffer(pem) {
            const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '');
            const binary = window.atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes.buffer;
        }

        // Serialize the data properly
        const jsonString = JSON.stringify(data);

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonString);

        try {
            const publicKeyBuffer = pemToArrayBuffer(publicKeyPem);
            const importedKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer, {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                false, ["encrypt"]
            );

            const encryptedData = await window.crypto.subtle.encrypt({
                    name: "RSA-OAEP"
                },
                importedKey,
                dataBuffer
            );
            return btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData)));
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }

    // FE Encryption
    static async encryptUserId(userId) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(userId);

            // Generate AES key
            const keyMaterial = await crypto.subtle.digest(
                'SHA-256',
                encoder.encode(process.env.NEXT_PUBLIC_USER_ID_SECRET)
            );
            const key = await crypto.subtle.importKey(
                'raw',
                keyMaterial, { name: 'AES-GCM' },
                false, ['encrypt']
            );

            // Generate IV (12 bytes)
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Encrypt the user ID
            const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv },
                key,
                data
            );

            // Extract encrypted content and auth tag
            const encryptedContent = new Uint8Array(encrypted);

            // Combine IV + Encrypted Content into a single Uint8Array
            const result = new Uint8Array(iv.length + encryptedContent.length);
            result.set(iv);
            result.set(encryptedContent, iv.length);

            // Encode to Base64
            const encryptedBase64 = btoa(String.fromCharCode(...result));

            return encryptedBase64;
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }


    static async clientRegistration(obj) {
        console.log({ obj })
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/client/register',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }

    static async clientLogin(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/client/login',
                data: obj,
            });
            console.log({ response });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }

    static async clientProfile() {
        try {
            const response = await axiosPrivate({
                method: "GET",
                url: '/client/profile',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }

    // driver registration
    static async driverRegistration(obj) {
        console.log({ obj })
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/driver/register',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }

    // driver login
    static async driverLogin(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/driver/login',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }

    // driver profile 
    static async driverProfile() {
        try {
            const response = await axiosPrivate({
                method: "GET",
                url: '/driver/profile',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({ error });
            throw new Error(error);
        }
    }





}

export default AdminUtils;