import crypto from 'crypto';

function generatePEMKeyPair() {
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

// const { publicKey, privateKey } = generatePEMKeyPair();
// console.log('Public Key:', publicKey);
// console.log('Private Key:', privateKey);


async function decryptUserId(encryptedId) {
    const dataSecret = "ih45c28ObvPV+RNNkYUaaN8V3zOXazsy"
    try {
        // Convert Base64 back to buffer
        const buffer = Buffer.from(encryptedId, 'base64');
        console.log("Decoded Buffer:", buffer);

        // Extract IV (first 12 bytes), ciphertext, and authentication tag
        const iv = buffer.slice(0, 12);
        const ciphertext = buffer.slice(12, -16); // Everything except the last 16 bytes
        const authTag = buffer.slice(-16); // Last 16 bytes as auth tag

        console.log("Extracted IV:", iv);
        console.log("Extracted Ciphertext:", ciphertext);
        console.log("Extracted AuthTag:", authTag);

        // Generate AES-256-GCM key from the same secret
        const keyMaterial = await crypto.createHash('sha256')
            .update(dataSecret)
            .digest();
        console.log("Key Material:", keyMaterial);

        // Create decipher instance
        const decipher = await crypto.createDecipheriv('aes-256-gcm', keyMaterial, iv);
        decipher.setAuthTag(authTag);

        console.log("Decipher instance created.");

        // Decrypt the ciphertext
        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        console.log("Decrypted User ID:", decrypted.toString('utf8'));
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt user ID');
    }
}


const encryptedId = "zqIp3IWsZ1+P0X0v6XVltd0Zzfs+D0y1xt8sBMlO7K5LScfuMQVdbI+JQIFv3H3rfk5DSg==";
const id = await (decryptUserId(encryptedId));
console.log({ id });