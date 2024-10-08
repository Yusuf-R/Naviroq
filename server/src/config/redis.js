require('dotenv').config({
    path: '../server/.env',
});
const Redis = require('ioredis');

// const url = process.env.REDIS_URL;
const redisURL = process.env.REDIS_LOCAL_URL;
const msg = 'Redis connection is not alive';

class RedisClient {
    constructor() {
        this.client = new Redis(redisURL);
        this.client.on('error', (error) => {
            console.error(error);
        });
        this.client.on('connect', () => {
            console.log('Redis client connected to the server');
        });
    }

    async isAlive() {
        if (!await this.client.ping()) {
            return false;
        }
        return true;
    }

    async get(key) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            return await this.client.get(key);
        } catch (error) {
            throw new Error(error);
        }
    }

    async set(key, value, duration) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            await this.client.set(key, value, 'EX', duration);
        } catch (error) {
            throw new Error(error);
        }
    }

    async del(key) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            return await this.client.del(key);
        } catch (error) {
            throw new Error(error);
        }
    }

    // Add functionality for managing the blacklist
    async addToBlacklist(staffId, tokenId) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            await this.client.sadd(`blacklistedTokens:${staffId}`, tokenId);
        } catch (error) {
            throw new Error(error);
        }
    }

    async isInBlacklist(staffId, tokenId) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            return await this.client.sismember(`blacklistedTokens:${staffId}`, tokenId);
        } catch (error) {
            throw new Error(error);
        }
    }

    async removeFromBlacklist(staffId, tokenId) {
        try {
            if (!await this.isAlive()) {
                return new Error(msg);
            }
            await this.client.srem(`blacklistedTokens:${staffId}`, tokenId);
        } catch (error) {
            throw new Error(error);
        }
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;