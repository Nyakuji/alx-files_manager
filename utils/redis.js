const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isClientConnected = true;
    this.client.on('error', (error) => {
      console.error(`Redis client not connected to the server: ${error}`);
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  // Method to check if Redis client is alive
  isAlive() {
    return this.client.connected;
  }

  /**
   * Asynchronous method to get value from Redis by key
   * @param {string} key - The key to retrieve the value from Redis.
   * @returns {Promise<string>} - The value associated with the key.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  /**
   * Asynchronous method to set value from Redis by key
   * @param {string} key - The key to retrieve the value from Redis.
   * @returns {Promise<string>} - The value associated with the key.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  /**
     * Asynchronous method to delete value from Redis by key
     * @param {string} key - The key to delete the value from Redis.
     * @returns {Promise<number>} - The number of keys that were deleted.
     */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(1);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
