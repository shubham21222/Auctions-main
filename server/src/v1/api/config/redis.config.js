import { createClient } from "redis";

let isRedisConnected = false;
let redisClient = null;

// Try to connect to Redis but don't fail if it's not available
try {
  redisClient = createClient({
    url: "redis://127.0.0.1:6379",
    socket: {
      reconnectStrategy: false, // Disable automatic reconnection
      connectTimeout: 2000 // 2 second timeout
    }
  });

  // Only log errors once, not repeatedly
  let errorLogged = false;
  redisClient.on("error", (err) => {
    if (!errorLogged) {
      console.warn("⚠️ Redis not available - caching disabled.");
      errorLogged = true;
    }
    isRedisConnected = false;
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected successfully");
    isRedisConnected = true;
  });

  await redisClient.connect();
  isRedisConnected = true;
} catch (error) {
  console.warn("⚠️ Redis not available - caching disabled. Server will continue without Redis.");
  isRedisConnected = false;
  redisClient = null;
}

// Create a safe wrapper that handles Redis being unavailable
const safeRedisClient = {
  async get(key) {
    if (!isRedisConnected || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (err) {
      return null;
    }
  },
  async setEx(key, seconds, value) {
    if (!isRedisConnected || !redisClient) return;
    try {
      return await redisClient.setEx(key, seconds, value);
    } catch (err) {
      // Silent fail
    }
  },
  async del(key) {
    if (!isRedisConnected || !redisClient) return;
    try {
      return await redisClient.del(key);
    } catch (err) {
      // Silent fail
    }
  },
  isConnected: () => isRedisConnected
};

export default safeRedisClient;
