import crypto from 'crypto';
const ivLength = 12;

const nacl = require("tweetnacl");
const util = require("tweetnacl-util");

class AuthController {


    static async hashPassword(password) {
        try {
            const bcrypt = require("bcrypt");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error("Error hashing password:", error.message);
            throw new Error("Password hashing failed");
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        try {
            const bcrypt = require("bcrypt");
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error("Error comparing passwords:", error.message);
            throw new Error("Password comparison failed");
        }
    }

    static async generatePEMKeyPair() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
    }

    // Load private key from environment (ensure it's PEM formatted)
    static async decryptData(encryptedData, nonce, privateKeyBase64, publicKeyBase64) {
        const privateKey = util.decodeBase64(privateKeyBase64);
        const publicKey = util.decodeBase64(publicKeyBase64);
        const message = util.decodeBase64(encryptedData);
        const nonceUint8 = util.decodeBase64(nonce);

        const decryptedMessage = nacl.box.open(message, nonceUint8, publicKey, privateKey);
        if (!decryptedMessage) throw new Error("Decryption failed.");

        return JSON.parse(util.encodeUTF8(decryptedMessage));
    }

    // Function to decrypt data (AES-GCM decryption) for Password and login operations
    static async decryptedCredentials(encryptedData) {
        const rawKey = process.env.PEM_PRIVATE_KEY;
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt({
                key: rawKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
                buffer
            );
            const jsonString = decrypted.toString('utf8');
            // Parse the JSON string
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    }

    // Headless check
    static async headlessCheck(request) {
        try {
            const authHeader = request.headers.get("Authorization");
            if (!authHeader) {
                throw new Error("No Authorization header found");
            }
            const encryptedId = authHeader.split(" ")[1]
            if (!encryptedId) {
                throw new Error("Invalid Authorization header");
            }
            const userId = await AuthController.decryptUserId(encryptedId);
            if (!userId) {
                throw new Error("Invalid user ID");
            }
            return userId;
        } catch (error) {
            console.error(error);
            throw new Error("Unauthorized");
        }

    }

    // BE Decryption for user Id
    static async decryptUserId(encryptedId) {
        try {

            // Convert Base64 back to buffer
            const buffer = Buffer.from(encryptedId, 'base64');

            // Extract IV (first 12 bytes), ciphertext, and authentication tag
            const iv = buffer.slice(0, 12);
            const ciphertext = buffer.slice(12, -16); // Everything except the last 16 bytes
            const authTag = buffer.slice(-16); // Last 16 bytes as auth tag

            // Generate AES-256-GCM key from the same secret
            const keyMaterial = crypto.createHash('sha256')
                .update(process.env.NEXT_PUBLIC_USER_ID_SECRET)
                .digest();

            // Create decipher instance
            const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial, iv);
            decipher.setAuthTag(authTag);

            // Decrypt the ciphertext
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ]);

            return decrypted.toString('utf8');
        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error("Failed to decrypt user ID");
        }

    }



}

export default AuthController;