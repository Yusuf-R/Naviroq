'use client';
import { axiosPublic, axiosPrivate } from "@/utils/AxiosInstance"
import useClientStore from "@/store/useClientStore";
import useDriverStore from "@/store/useDriverStore";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, decodeUTF8 } from "tweetnacl-util";
const publicKeyBase64 = process.env.NEXT_PUBLIC_TWEETNACL_PUBLIC_KEY;

class AdminUtils {

    // Encrypt data using the PEM public key stored as an environment variable
    static async encryptDataWithTweetNaCl(data) { 
        const publicKey = decodeBase64(publicKeyBase64);
        const messageUint8 = decodeUTF8(JSON.stringify(data));
    
        // Generate a nonce for encryption
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const encryptedMessage = nacl.box(messageUint8, nonce, publicKey, nacl.box.keyPair().secretKey);
    
        return {
            encryptedMessage: encodeBase64(encryptedMessage),
            nonce: encodeBase64(nonce),
        };

    }
        
    // Usage example with Zustand storage
    static async encryptAndStoreProfile(profileData) {
        try {
            const encryptedData = await AdminUtils.encryptDataWithTweetNaCl(profileData, publicKeyBase64);
            if (profileData.role === 'Client') {
                useClientStore.getState().setEncryptedClientData(encryptedData);
            } else if (profileData.role === 'Driver') {
                useDriverStore.getState().setEncryptedDriverData(encryptedData);
            }
            return;
        } catch (error) {
            console.error("Failed to encrypt and store data with TweetNaCl:", error);
        }
    }

    // to be used for Registration. Login and SetPassword Specific operations
    static async encryptCredentials(data) {
        const publicKeyPem = process.env.NEXT_PUBLIC_PEM_PUBLIC_KEY;
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

    static async clientLogout() {
        try {
            const response = await axiosPrivate({
                method: "POST",
                url: '/client/logout',
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

    static async updateClientBiodata(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/client/profile/update',
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

    static async clientAvatar(formData) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/client/profile/avatar',
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                // Add this to properly handle the FormData
                transformRequest: [function (data) {
                    return data;
                }],
            });
            
            if (response.status === 201) {
                return response.data;
            } else {
                console.error('Upload response:', response);
                throw new Error(response.data?.error || 'Upload failed');
            }
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    static async setClientLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/client/location',
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

    static async addClientLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/client/location/add',
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

    static async deleteClientLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "DELETE",
                url: '/client/location/delete',
                data: obj,
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

    static async editClientLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/client/location/edit',
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

    static async dataDecryption(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/client/decrypt',
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

    // driver registration
    static async driverRegistration(obj) {
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

    static async driverLogout() {
        try {
            const response = await axiosPrivate({
                method: "POST",
                url: '/driver/logout',
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

    static async updateDriverBiodata(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/driver/profile/update',
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

    static async driverAvatar(formData) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/driver/profile/avatar',
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                // Add this to properly handle the FormData
                transformRequest: [function (data) {
                    return data;
                }],
            });
            
            if (response.status === 201) {
                return response.data;
            } else {
                console.error('Upload response:', response);
                throw new Error(response.data?.error || 'Upload failed');
            }
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    


    static async setDriverLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/driver/location',
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

    static async addDriverLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/driver/location/add',
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

    static async deleteDriverLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "DELETE",
                url: '/driver/location/delete',
                data: obj,
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

    static async editDriverLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/driver/location/edit',
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


   





}

export default AdminUtils;