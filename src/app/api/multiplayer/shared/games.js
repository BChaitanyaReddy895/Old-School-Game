/**
 * Shared in-memory game state store
 * 
 * ⚠️ WARNING: This is an in-memory store that will not persist across Vercel serverless function invocations.
 * Game state may be lost between requests, especially under high load or cold starts.
 * 
 * For production use, consider migrating to a persistent datastore like:
 * - Redis (recommended for real-time games)
 * - PostgreSQL with real-time extensions
 * - MongoDB with change streams
 * - Firebase Realtime Database
 * 
 * Current limitations:
 * - State is isolated per lambda instance
 * - No persistence across function invocations
 * - Potential for lost game state
 * - Not suitable for high-traffic production environments
 */
const games = global.games || (global.games = {});

export { games }; 